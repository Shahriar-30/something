import dotenv from "dotenv";
import express from "express";
import {
  sendSuccess,
  sendError,
  asyncHandler,
} from "./utils/response/index.js";
import {
  globalErrorHandler,
  responseTimeMiddleware,
} from "./middleware/errorHandler.js";
import { databaseConfig } from "./config/database.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(responseTimeMiddleware);

// Routes
app.get("/", (req, res) => {
  return sendSuccess(res, "Welcome to the API", { version: "1.0.0" });
});

app.get("/health", (req, res) => {
  return sendSuccess(res, "Server is healthy", {
    status: "OK",
    timestamp: new Date(),
  });
});

// Example async route with error handling
app.get(
  "/test-async",
  asyncHandler(async (req, res) => {
    // Simulate some async operation
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Simulate potential error
    if (req.query.error === "true") {
      throw new Error("Simulated error for testing");
    }

    return sendSuccess(res, "Async operation completed", { data: "test data" });
  })
);

// Example route with validation
app.post(
  "/users",
  asyncHandler(async (req, res) => {
    const { name, email } = req.body;

    // Basic validation
    if (!name || !email) {
      return sendError(res, "Name and email are required", 400);
    }

    // Simulate user creation
    const newUser = {
      id: Date.now(),
      name,
      email,
      createdAt: new Date(),
    };

    return sendSuccess(res, "User created successfully", newUser, 201);
  })
);

// 404 handler
app.use((req, res) => {
  return sendError(res, "Route not found", 404);
});

// Global error handler (must be last)
app.use(globalErrorHandler);

// Initialize database and start server
async function startServer() {
  try {
    await databaseConfig();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
