import { chromium } from "playwright";
import { Book } from "../types";

export class ScraperService {
  private readonly baseUrl =
    process.env.BOOKDP_BASE_URL ?? "https://www.bookdp.com.au";

  async scrapeBooks(theme: string): Promise<Book[]> {
    console.log("\n=== Starting Book Scraping Process ===");

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const mainPage = await context.newPage();
    const books: Book[] = [];

    try {
      // Scrape first two pages
      for (let pageNum = 1; pageNum <= 2; pageNum++) {
        const url = `${this.baseUrl}/page/${pageNum}/?s=${encodeURIComponent(theme)}&post_type=product`;
        console.log(`\nNavigating to search URL: ${url}`);

        // Navigate to search page
        await mainPage.goto(url);
        console.log("Search page loaded successfully");

        console.log(`\n=== Processing Page ${pageNum} ===`);

        // Get all product links on the page
        const productLinks = await mainPage.$$eval(
          "h2.woocommerce-loop-product__title a.woocommerce-LoopProduct-link",
          (links: HTMLAnchorElement[]) => links.map((link) => link.href)
        );

        // Visit each product page and extract structured data
        for (const productUrl of productLinks) {
          // Create a new page for each product
          const productPage = await context.newPage();
          try {
            await productPage.goto(productUrl);
            await productPage.waitForLoadState("networkidle");
            console.log("Product page loaded successfully");

            // Extract JSON-LD data
            const jsonLdData = await productPage.$eval(
              'script[type="application/ld+json"]',
              (el) => {
                try {
                  return JSON.parse(el.textContent ?? "{}");
                } catch (e) {
                  console.error("Error parsing JSON-LD:", e);
                  return {};
                }
              }
            );

            // Find the Product object in the @graph array
            const productData = jsonLdData["@graph"]?.find(
              (item: any) => item["@type"] === "Product"
            );

            if (productData) {
              console.log("Found product data:", {
                title: productData.name?.split("|")[0]?.trim(),
                price: productData.offers?.price,
              });

              // Get original price from HTML
              const originalPriceText = await productPage.$eval(
                "del .woocommerce-Price-amount",
                (el) => el.textContent?.replace(/[^0-9.]/g, "") ?? ""
              );
              console.log("Original price:", originalPriceText);

              // Get description from HTML
              const description = await productPage.$eval(
                ".woocommerce-tabs--description-content p",
                (el) => el.textContent?.trim() ?? ""
              );

              const book: Book = {
                description,
                author: productData.brand?.name ?? "",
                title: productData.name?.split("|")[0]?.trim() ?? "",
                currentPrice: parseFloat(productData.offers?.price ?? "0"),
                productUrl: productData.mainEntityOfPage?.["@id"] ?? productUrl,
              };

              if (originalPriceText.length > 0) {
                book.originalPrice = parseFloat(originalPriceText);
              }

              books.push(book);
              console.log("Successfully added book to collection");
            }
          } catch (error) {
            console.error(`Error scraping product at ${productUrl}:`, error);
          } finally {
            // Close the product page after scraping
            await productPage.close();
          }
        }
      }

      console.log(`\n=== Scraping Complete ===`);
      console.log(`Total books scraped: ${books.length}`);
    } catch (error) {
      console.error("\n=== Error during scraping ===");
      console.error(error);
      throw new Error("Failed to scrape books");
    } finally {
      await mainPage.close();
      await browser.close();
      console.log("Browser closed");
    }

    return books;
  }
}
