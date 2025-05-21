import dotenv from "dotenv";
import express from "express";

import { ScrapeRequest } from "./types";
import { ApiController } from "./controllers/api.controller";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT ?? 3000;
const apiController = new ApiController();

// Middleware
app.use(express.json());

// Routes
app.post(
  "/scrape",
  (req: express.Request<{}, {}, ScrapeRequest>, res: express.Response) => {
    apiController.scrapeBooks(req, res);
  }
);

app.get(
  "/status/:jobId",
  (req: express.Request<{ jobId: string }>, res: express.Response) => {
    apiController.getJobStatus(req, res);
  }
);

app.get(
  "/results/:jobId",
  (req: express.Request<{ jobId: string }>, res: express.Response) => {
    apiController.getResults(req, res);
  }
);

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      message: "Something went wrong!",
    });
  }
);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
