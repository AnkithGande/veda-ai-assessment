import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/config/database";
import { AppError } from "@/middleware/errorHandler";
import { env } from "@/config/env";
import type { RegisterInput, LoginInput } from "./auth.schema";

const SALT_ROUNDS = 10;

export interface AuthPayload {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

// ─── Register ─────────────────────────────────────────────────────────────────

export async function register(input: RegisterInput): Promise<AuthPayload> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new AppError(409, "An account with this email already exists");
  }

  const hashed = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashed,
    },
  });

  return {
    token: signToken(user.id),
    user: { id: user.id, name: user.name, email: user.email },
  };
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginUser(input: LoginInput): Promise<AuthPayload> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  // Use constant-time comparison even when user not found
  const passwordToCheck = user?.password ?? "$2a$10$invalidhashfortimingatk";
  const valid = await bcrypt.compare(input.password, passwordToCheck);

  if (!user || !valid) {
    throw new AppError(401, "Invalid email or password");
  }

  return {
    token: signToken(user.id),
    user: { id: user.id, name: user.name, email: user.email },
  };
}

// ─── Get current user ─────────────────────────────────────────────────────────

export async function getCurrentUser(
  userId: string
): Promise<{ id: string; name: string; email: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  if (!user) throw new AppError(404, "User not found");
  return user;
}

// ─── Verify JWT ───────────────────────────────────────────────────────────────

export function verifyToken(token: string): { sub: string } {
  try {
    return jwt.verify(token, env.JWT_SECRET) as { sub: string };
  } catch {
    throw new AppError(401, "Invalid or expired token");
  }
}
