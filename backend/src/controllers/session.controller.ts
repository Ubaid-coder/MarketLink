import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {
  getUserSessions,
  revokeUserSession,
  revokeAllUserSessions,
} from "../services/session.service.js";

export const getSessionsController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessions = await getUserSessions(
      req.user!.userId
    );

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

export const revokeSessionController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { sessionId } = req.params as { sessionId: string };

    const revoked = await revokeUserSession(
      req.user!.userId,
      sessionId
    );

    if (!revoked) {
      res.status(404).json({
        success: false,
        message: "Session not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      message: "Session revoked successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const revokeAllSessionsController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await revokeAllUserSessions(req.user!.userId);

    res.status(200).json({
      success: true,
      message: "All sessions revoked successfully",
    });
  } catch (error) {
    next(error);
  }
};