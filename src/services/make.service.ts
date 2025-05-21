import axios from "axios";
import { Book } from "../types";

export class MakeService {
  private readonly webhookUrl: string;

  constructor() {
    this.webhookUrl = process.env.MAKE_WEBHOOK_URL ?? "";
    if (!this.webhookUrl) {
      throw new Error("Make.com webhook URL is not configured");
    }
  }

  private async sendSingleBook(book: Book): Promise<void> {
    try {
      await axios.post(this.webhookUrl, { ...book });
      console.log(`Successfully sent book: ${book.title}`);
    } catch (error) {
      console.error(`Error sending book ${book.title} to Make.com:`, error);
      throw new Error(`Failed to send book ${book.title} to Make.com`);
    }
  }

  async sendResults(books: Book[]): Promise<void> {
    console.log(`\n=== Sending books to Make.com ===`);

    for (const book of books) {
      try {
        await this.sendSingleBook(book);
        // Add a 1 second delay between each book send
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to send book ${book.title}:`, error);
        // Continue with next book even if one fails
        continue;
      }
    }
  }
}
