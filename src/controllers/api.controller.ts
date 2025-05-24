import Joi from "joi";
import { Request, Response } from "express";

import { ScrapeRequest, JobStatus } from "../types";
import { JobService } from "../services/job.service";

export class ApiController {
  private readonly jobService: JobService;
  private readonly validationSchemas = {
    scrapeRequest: Joi.object<ScrapeRequest>({
      theme: Joi.string()
        .min(3)
        .max(50)
        .required()
        .pattern(/^[a-zA-Z\s]+$/)
        .messages({
          "any.required": "Theme is required",
          "string.empty": "Theme cannot be empty",
          "string.max": "Theme cannot exceed 50 characters",
          "string.base": "Invalid format, Theme must be a string",
          "string.min": "Theme must be at least 3 characters long",
          "string.pattern.base": "Theme should only contain letters and spaces",
        }),
    }),
    jobId: Joi.string().required().uuid().messages({
      "any.required": "Job ID is required",
      "string.guid": "Invalid job ID format",
    }),
  };

  constructor() {
    this.jobService = new JobService();
  }

  async scrapeBooks(req: Request<{}, {}, ScrapeRequest>, res: Response) {
    try {
      const { error, value } = this.validationSchemas.scrapeRequest.validate(
        req.body,
        { abortEarly: true, stripUnknown: true }
      );

      if (error) {
        return res.status(400).json({
          message: error.details[0].message,
          data: null,
        });
      }

      const jobId = await this.jobService.createJob(value.theme);

      res.status(202).json({
        message: "Book scraping job created successfully",
        data: { status: "pending", jobId },
      });
    } catch (error) {
      console.error("Error creating scrape job:", error);
      res.status(500).json({
        message: "Failed to create scrape job",
        data: null,
      });
    }
  }

  async getJobStatus(req: Request<{ jobId: string }>, res: Response) {
    try {
      const { error, value } = this.validationSchemas.jobId.validate(
        req.params.jobId,
        { abortEarly: true }
      );

      if (error) {
        return res.status(400).json({
          message: error.details[0].message,
          data: null,
        });
      }

      const job = this.jobService.getJobStatus(value);

      if (!job) {
        return res.status(404).json({ message: "Job not found", data: null });
      }

      res.json({
        message: "Job retrieved successfully",
        data: job,
      });
    } catch (error) {
      console.error("Error getting job status:", error);
      res.status(500).json({ message: "Failed to get job status", data: null });
    }
  }

  async getResults(req: Request<{ jobId: string }>, res: Response) {
    try {
      const { error, value } = this.validationSchemas.jobId.validate(
        req.params.jobId,
        { abortEarly: true }
      );

      if (error) {
        return res.status(400).json({
          message: error.details[0].message,
          data: null,
        });
      }

      const job = this.jobService.getJobStatus(value);

      if (!job) {
        return res.status(404).json({ message: "Job not found", data: null });
      }

      res.json({
        message: "Books retrieved successfully",
        data: { books: job.books, status: job.status },
      });
    } catch (error) {
      console.error("Error getting results:", error);
      res.status(500).json({ message: "Failed to get results", data: null });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const history = this.jobService.getJobHistory();

      res.json({
        message: "Job history retrieved successfully",
        data: history.map((job: JobStatus) => ({
          jobId: job.id,
          theme: job.theme,
          books: job.books || [],
        })),
      });
    } catch (error) {
      console.error("Error getting job history:", error);
      res.status(500).json({
        message: "Failed to get job history",
        data: null,
      });
    }
  }

  async deleteJob(req: Request<{ jobId: string }>, res: Response) {
    try {
      const { error, value } = this.validationSchemas.jobId.validate(
        req.params.jobId,
        { abortEarly: true }
      );

      if (!error) {
        this.jobService.deleteJob(value);
      }
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  }
}
