import express, { Express, Request, Response } from "express";

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON bodies
app.use(express.json());

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from Express + TypeScript!" });
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK" });
});

// Start server
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

// src/types/index.ts
export interface ErrorResponse {
  message: string;
  status: number;
}
