import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { errorHandler, notFoundHandler, requestLogger } from "./middleware";
import routes from "./routes";

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Explicit origin list supports both local dev and Vercel production.
// credentials: true is required for Authorization header on cross-origin requests.

const corsOptions: cors.CorsOptions = {
  origin: [
    "http://localhost:3000",
    "https://veda-ai-assessment-pearl.vercel.app",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// Handle preflight OPTIONS requests for all routes (required for multipart uploads)
app.options("*", cors(corsOptions));

// ─── Body parsing ─────────────────────────────────────────────────────────────
// Note: multipart/form-data (PDF uploads) is handled by multer per-route.
// express.json / urlencoded handle JSON and URL-encoded bodies only.

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

if (env.isDev) {
  app.use(requestLogger);
}

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use("/api", routes);

// ─── Error Handling ───────────────────────────────────────────────────────────

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
