import dotenv from "dotenv";
import express from "express";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT ?? 3000;

// Middleware
app.use(express.json());

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
