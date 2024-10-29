import express, { Express, Request, Response } from "express";
import authRoutes from "./routes/authRoutes";
import "dotenv/config";
import taskRoutes from "./routes/tasksRoutes";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";

const app: Express = express();
const port = process.env.PORT || 3000;

const corsOpts = {
  origin: ["http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
  credentials: true,
};
app.use(cors(corsOpts));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms"),
);

app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);
// app.use("/auth/profile", profileRoutes);

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

export interface ErrorResponse {
  message: string;
  status: number;
}
