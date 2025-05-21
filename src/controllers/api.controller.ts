import { Request, Response } from "express";

import { ScrapeRequest } from "../types";
import { JobService } from "../services/job.service";

export class ApiController {
  private readonly jobService: JobService;

  constructor() {
    this.jobService = new JobService();
  }

  async scrapeBooks(req: Request<{}, {}, ScrapeRequest>, res: Response) {
    try {
      const { theme } = req.body;

      if (!theme) {
        return res.status(400).json({ message: "Theme is required" });
      }

      const jobId = await this.jobService.createJob(theme);

      res.status(202).json({
        message: "Book scraping job created successfully",
        data: { status: "pending", jobId },
      });
    } catch (error) {
      console.error("Error creating scrape job:", error);
      res.status(500).json({ message: "Failed to create scrape job" });
    }
  }

  async getJobStatus(req: Request<{ jobId: string }>, res: Response) {
    try {
      const { jobId } = req.params;
      const job = this.jobService.getJobStatus(jobId);

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      res.json({ data: job });
    } catch (error) {
      console.error("Error getting job status:", error);
      res.status(500).json({ message: "Failed to get job status" });
    }
  }

  async getResults(req: Request<{ jobId: string }>, res: Response) {
    try {
      const { jobId } = req.params;
      const job = this.jobService.getJobStatus(jobId);

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      res.json({ data: { books: job.books, status: job.status } });
    } catch (error) {
      console.error("Error getting results:", error);
      res.status(500).json({ message: "Failed to get results" });
    }
  }
}
