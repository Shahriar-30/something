import mongoose from "mongoose";
import { logger } from "./logger.js";

/**
 * Database configuration and connection management
 * Provides production-ready MongoDB connection with proper error handling
 */

class Database {
  constructor() {
    this.isConnected = false;
    this.connection = null;
  }

  /**
   * Validate required environment variables
   * @throws {Error} If required environment variables are missing
   */
  validateEnvironment() {
    const requiredEnvVars = ["DATABASE_URL", "DATABASE_NAME"];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }
  }

  /**
   * Get MongoDB connection options
   * @returns {Object} Mongoose connection options
   */
  getConnectionOptions() {
    const isProduction = process.env.NODE_ENV === "production";

    return {
      // Connection settings
      maxPoolSize: isProduction ? 10 : 5, // Maximum number of connections in the connection pool
      minPoolSize: 2, // Minimum number of connections in the connection pool
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering

      // Retry settings
      retryWrites: true,
      retryReads: true,

      // Additional options for production
      ...(isProduction && {
        ssl: true, // Enable SSL in production
        tlsAllowInvalidCertificates: false, // Don't allow invalid certificates
      }),
    };
  }

  /**
   * Build MongoDB connection URI
   * @returns {string} Complete MongoDB connection URI
   */
  buildConnectionUri() {
    const { DATABASE_URL, DATABASE_NAME } = process.env;
    const baseUrl = DATABASE_URL.endsWith("/")
      ? DATABASE_URL.slice(0, -1)
      : DATABASE_URL;

    return `${baseUrl}/${DATABASE_NAME}`;
  }

  /**
   * Set up connection event listeners
   */
  setupEventListeners() {
    mongoose.connection.on("connected", () => {
      this.isConnected = true;
      logger.info("MongoDB connected successfully", {
        database: process.env.DATABASE_NAME,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
      });
    });

    mongoose.connection.on("error", (error) => {
      this.isConnected = false;
      logger.error("MongoDB connection error", {
        error: error.message,
        stack: error.stack,
      });
    });

    mongoose.connection.on("disconnected", () => {
      this.isConnected = false;
      logger.warn("MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      this.isConnected = true;
      logger.info("MongoDB reconnected");
    });

    // Handle application termination
    process.on("SIGINT", this.gracefulShutdown.bind(this));
    process.on("SIGTERM", this.gracefulShutdown.bind(this));
  }

  /**
   * Connect to MongoDB with retry logic
   * @param {number} maxRetries - Maximum number of retry attempts
   * @param {number} retryDelay - Delay between retries in milliseconds
   * @returns {Promise<void>}
   */
  async connectWithRetry(maxRetries = 5, retryDelay = 2000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(
          `Attempting to connect to MongoDB (attempt ${attempt}/${maxRetries})`
        );

        const uri = this.buildConnectionUri();
        const options = this.getConnectionOptions();

        await mongoose.connect(uri, options);
        this.connection = mongoose.connection;

        logger.info("Database connection established successfully");
        return;
      } catch (error) {
        logger.error(`Database connection attempt ${attempt} failed`, {
          error: error.message,
          attempt,
          maxRetries,
        });

        if (attempt === maxRetries) {
          throw new Error(
            `Failed to connect to database after ${maxRetries} attempts: ${error.message}`
          );
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  /**
   * Gracefully shutdown database connection
   */
  async gracefulShutdown() {
    try {
      logger.info("Closing database connection...");
      await mongoose.connection.close();
      logger.info("Database connection closed successfully");
      process.exit(0);
    } catch (error) {
      logger.error("Error during database shutdown", { error: error.message });
      process.exit(1);
    }
  }

  /**
   * Check database connection health
   * @returns {Object} Connection health status
   */
  getHealthStatus() {
    const connection = mongoose.connection;

    return {
      isConnected: this.isConnected,
      readyState: connection.readyState,
      database: connection.db?.databaseName || null,
      host: connection.host || null,
      name: connection.name || null,
      models: Object.keys(mongoose.models).length,
    };
  }

  /**
   * Initialize database connection
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      // Validate environment variables
      this.validateEnvironment();

      // Set up event listeners
      this.setupEventListeners();

      // Connect with retry logic
      await this.connectWithRetry();
    } catch (error) {
      logger.error("Database initialization failed", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}

// Create singleton instance
const database = new Database();

/**
 * Initialize database connection
 * @returns {Promise<void>}
 */
export async function databaseConfig() {
  await database.initialize();
}

/**
 * Get database health status
 * @returns {Object} Connection health information
 */
export function getDatabaseHealth() {
  return database.getHealthStatus();
}

/**
 * Close database connection
 * @returns {Promise<void>}
 */
export async function closeDatabaseConnection() {
  await database.gracefulShutdown();
}

// Export the database instance for advanced usage
export { database };
