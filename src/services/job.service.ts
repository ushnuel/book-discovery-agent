import { v4 as uuidv4 } from "uuid";

import { JobStatus } from "../types";
import { AIService } from "./ai.service";
import { ScraperService } from "./scraper.service";

export class JobService {
  private readonly aiService: AIService;
  private readonly scraperService: ScraperService;
  private readonly jobs: Map<string, JobStatus> = new Map();

  constructor() {
    this.aiService = new AIService();
    this.scraperService = new ScraperService();
  }

  async createJob(theme: string): Promise<string> {
    const jobId = uuidv4();
    const job: JobStatus = {
      theme,
      id: jobId,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.jobs.set(jobId, job);
    this.processJob(jobId, theme).catch(console.error);
    return jobId;
  }

  getJobStatus(jobId: string): JobStatus | undefined {
    return this.jobs.get(jobId);
  }

  private async processJob(jobId: string, theme: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    try {
      // Update status to processing
      job.status = "processing";
      job.updatedAt = new Date();

      // Scrape books
      const books = await this.scraperService.scrapeBooks(theme);
      console.log("Scraped books:", books);

      // Enrich books with AI
      const enrichedBooks = await Promise.all(
        books.map((book) => this.aiService.enrichBook(book, theme))
      );

      // Update job status
      job.status = "completed";
      job.books = enrichedBooks;
      job.updatedAt = new Date();
    } catch (error) {
      job.status = "failed";
      job.updatedAt = new Date();
      job.error =
        error instanceof Error ? error.message : "Unknown error occurred";
    }
  }

  getJobHistory(): JobStatus[] {
    return Array.from(this.jobs.values());
  }

  deleteJob(jobId: string): void {
    const job = this.getJobStatus(jobId);
    if (job) this.jobs.delete(jobId);
  }
}
