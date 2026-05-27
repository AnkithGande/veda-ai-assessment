import type { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

type ValidateTarget = "body" | "query" | "params";

// Extend Express Request to carry validated data without mutating read-only properties
declare global {
  namespace Express {
    interface Request {
      validated: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

/**
 * Express middleware factory for Zod schema validation.
 *
 * Parsed/coerced data is stored on req.validated[target] instead of
 * mutating req[target] directly — req.query is a getter-only property
 * in Express 5 / Node's IncomingMessage and cannot be reassigned.
 *
 * Usage: router.get("/", validate(mySchema, "query"), handler)
 * Access in handler: req.validated.query as MyType
 */
export function validate(schema: ZodSchema, target: ValidateTarget = "body") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = (result.error as ZodError).issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      res.status(422).json({
        success: false,
        error: "Validation failed",
        details: errors,
      });
      return;
    }

    // Store on req.validated — never mutate req.query / req.params
    if (!req.validated) {
      req.validated = {};
    }
    req.validated[target] = result.data;

    // For body, also write back — req.body is a plain object and is writable
    if (target === "body") {
      req.body = result.data;
    }

    next();
  };
}
