import { Session } from "../models/session.model.js";
import { hashToken } from "../utils/token.js";
import { Types } from "mongoose";

interface CreateSessionInput {
  sessionId: Types.ObjectId;
  userId: string;
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
}

export const createSession = async ({
  sessionId,
  userId,
  refreshToken,
  userAgent,
  ipAddress,
  expiresAt,
}: CreateSessionInput) => {
  return Session.create({
    _id: sessionId,
    userId,
    refreshTokenHash: hashToken(refreshToken),
    userAgent,
    ipAddress,
    expiresAt,
    lastUsedAt: new Date(),
  });
};;

export const findSessionByToken = async (
  refreshToken: string
) => {
  const refreshTokenHash = hashToken(refreshToken);

  return Session.findOne({
    refreshTokenHash,
  });
};

export const findSessionById = async (
  sessionId: string
) => {
  return Session.findById(sessionId);
};

export const revokeSession = async (
  sessionId: string
): Promise<void> => {
  await Session.findByIdAndUpdate(sessionId, {
    revokedAt: new Date(),
  });
};

export const revokeAllUserSessions = async (
  userId: string
): Promise<void> => {
  await Session.updateMany(
    {
      userId,
      revokedAt: null,
    },
    {
      revokedAt: new Date(),
    }
  );
};

export const updateSessionUsage = async (
  sessionId: string
): Promise<void> => {
  await Session.findByIdAndUpdate(sessionId, {
    lastUsedAt: new Date(),
  });
};

export const getUserSessions = async (userId: string) => {
  return Session.find({
    userId,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  })
    .select("-refreshTokenHash")
    .sort({ lastUsedAt: -1 });
};

export const revokeUserSession = async (
  userId: string,
  sessionId: string
): Promise<boolean> => {
  const result = await Session.findOneAndUpdate(
    {
      _id: sessionId,
      userId,
      revokedAt: null,
    }, {
    revokedAt: new Date(),
  }
  );

  return !!result;
}