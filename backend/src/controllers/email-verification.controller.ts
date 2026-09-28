import {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  verifyEmail,
} from "../services/email-verification.service.js";

export const verifyEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.query;

    if (
      typeof token !== "string" ||
      !token
    ) {
      res.status(400).json({
        success: false,
        message: "Verification token is required",
      });

      return;
    }

    await verifyEmail(token);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    next(error);
  }
};