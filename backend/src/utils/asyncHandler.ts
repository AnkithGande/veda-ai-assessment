import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an async route handler and forwards any thrown errors to next().
 * Eliminates try/catch boilerplate in controllers.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
