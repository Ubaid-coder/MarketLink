import {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  createPasswordResetToken,
  resetPassword,
  changePassword,
} from "../services/password.service.js";

import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { sendPasswordResetEmail } from "../services/email.service.js";

export const forgotPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await createPasswordResetToken(
      req.body.email
    );

    if (result) {
      await sendPasswordResetEmail(
        result.user.email,
        result.token
      );
    }

    /*
      IMPORTANT:
      Same response whether account exists or not.
      Prevents email/account enumeration.
    */

    res.status(200).json({
      success: true,
      message:
        "If an account exists with that email, a password reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, password } = req.body;

    const user = await resetPassword(
      token,
      password
    );

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const changePasswordController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    await changePassword(
      req.user!.userId,
      currentPassword,
      newPassword
    );

    res.status(200).json({
      success: true,
      message:
        "Password changed successfully. Please login again.",
    });
  } catch (error) {
    next(error);
  }
};
