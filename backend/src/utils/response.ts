import type { Response } from "express";
import type { ApiResponse, PaginatedResponse } from "@/types";

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  message?: string
): void {
  const body: ApiResponse<T> = { success: true, data, message };
  res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  error: string,
  statusCode = 400
): void {
  const body: ApiResponse = { success: false, error };
  res.status(statusCode).json(body);
}

export function sendPaginated<T>(
  res: Response,
  result: PaginatedResponse<T>
): void {
  res.status(200).json({ success: true, ...result });
}
