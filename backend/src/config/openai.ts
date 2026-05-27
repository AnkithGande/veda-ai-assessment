import OpenAI from "openai";
import { env } from "./env";

// ─── OpenAI Client Singleton ──────────────────────────────────────────────────

let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}
