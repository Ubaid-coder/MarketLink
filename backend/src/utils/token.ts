import crypto from 'crypto';
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.js";
import { Types } from "mongoose";
import { createSession } from '../services/session.service.js';

interface CreateAuthSessionInput {
  userId: string;
  role: string;
  userAgent?: string;
  ipAddress?: string;
}



export const hashToken = (token: string): string => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export const generateRandomToken = (bytes = 32): string => {
  return crypto.randomBytes(bytes).toString("hex");
}

export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const generateOAuthState = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const createAuthSession = async (
  { userId, role, userAgent, ipAddress }: CreateAuthSessionInput
) => {
  const sessionId = new Types.ObjectId();

  const accessToken = generateAccessToken({
    userId,
    role,
    sessionId: sessionId.toString(),
  });

  const refreshToken = generateRefreshToken({
    userId,
    sessionId: sessionId.toString(),
  });

  await createSession({
    sessionId,
    userId,
    refreshToken,
    userAgent,
    ipAddress,
    expiresAt: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ),
  });

  return {
    accessToken,
    refreshToken,
  };
};