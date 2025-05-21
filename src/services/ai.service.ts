import OpenAI from "openai";
import { Book } from "../types";

export class AIService {
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async enrichBook(book: Book, theme: string): Promise<Book> {
    try {
      // Generate summary
      const summaryResponse = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that summarizes book descriptions concisely.",
          },
          {
            role: "user",
            content: `Provide a 1 to 2 sentence summary of this book based on its description: ${book.description}`,
          },
        ],
        max_completion_tokens: 100,
      });

      // Calculate relevance score
      const relevanceResponse = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that evaluates book relevance to themes.",
          },
          {
            role: "user",
            content: `Rate the relevance of this book to the theme "${theme}" on a scale of 0 to 100. Only return a number. Title: ${book.title}, Author: ${book.author}. Description: ${book.description}. Only return a number between 0 and 100.`,
          },
        ],
        max_completion_tokens: 10,
      });

      const summary =
        summaryResponse.choices[0]?.message?.content?.trim() ?? "";
      const relevanceScoreContent = parseInt(
        relevanceResponse.choices[0]?.message?.content?.trim() ?? "0"
      );

      const relevanceScore = isNaN(relevanceScoreContent)
        ? 0
        : parseFloat(relevanceScoreContent.toFixed(2));

      const valueScoreInit = relevanceScore / book.currentPrice;

      // Calculate value metrics
      const enrichedBook: Book = {
        ...book,
        relevanceScore,
        aiSummary: summary,
        valueScore: isNaN(valueScoreInit)
          ? 0
          : parseFloat(valueScoreInit.toFixed(2)),
      };

      if (book.originalPrice) {
        const discountAmount = book.originalPrice - book.currentPrice;
        enrichedBook.discountAmount = parseFloat(discountAmount.toFixed(2));
        const discountPercentage = (discountAmount / book.originalPrice) * 100;
        enrichedBook.discountPercentage = Math.round(discountPercentage);
      }

      return enrichedBook;
    } catch (error) {
      console.error("Error during AI enrichment:", error);
      throw new Error("Failed to enrich book with AI");
    }
  }
}
