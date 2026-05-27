import dotenv from "dotenv";
import path from "path";

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  NODE_ENV: optional("NODE_ENV", "development"),
  PORT: parseInt(optional("PORT", "4000"), 10),

  DATABASE_URL: required("DATABASE_URL"),

  REDIS_HOST: optional("REDIS_HOST", "localhost"),
  REDIS_PORT: parseInt(optional("REDIS_PORT", "6379"), 10),
  REDIS_PASSWORD: optional("REDIS_PASSWORD", ""),

  OPENAI_API_KEY: optional("OPENAI_API_KEY", ""),

  CORS_ORIGIN: optional("CORS_ORIGIN", "http://localhost:3000"),

  JWT_SECRET: optional("JWT_SECRET", "dev-secret-change-in-production"),
  JWT_EXPIRES_IN: optional("JWT_EXPIRES_IN", "7d"),

  get isDev() {
    return this.NODE_ENV === "development";
  },
  get isProd() {
    return this.NODE_ENV === "production";
  },
} as const;
