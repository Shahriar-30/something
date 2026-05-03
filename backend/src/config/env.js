/**
 * Environment Configuration
 *
 * Centralizes required environment variables and fails fast when any
 * critical configuration is missing.
 */

import dotenv from "dotenv";

dotenv.config();

const requiredEnv = ["JWT_SECRET", "REFRESH_TOKEN_SECRET"];
const missingEnv = requiredEnv.filter((name) => !process.env[name]);

if (missingEnv.length > 0) {
  throw new Error(
    `Missing required environment variable(s): ${missingEnv.join(", ")}`
  );
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 8080,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || "30d",
  EMAIL_VERIFICATION_CODE_TTL_MINUTES:
    process.env.EMAIL_VERIFICATION_CODE_TTL_MINUTES || "15",
  BASE_URL: process.env.BASE_URL || "http://localhost:8080",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
};
