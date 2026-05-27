import express from "express";
import cors from "cors";
import { env } from "@/config/env";
import { errorHandler, notFoundHandler, requestLogger } from "@/middleware";
import routes from "@/routes";

const app = express();

// ─── Core Middleware ──────────────────────────────────────────────────────────

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
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
