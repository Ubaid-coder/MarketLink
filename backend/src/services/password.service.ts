import { User } from "../models/user.model.js";
import {
    generateRandomToken,
    hashToken,
} from "../utils/token.js";
import {
    hashPassword,
    comparePassword,
} from "../utils/password.js";
import {
    revokeAllUserSessions,
} from "./session.service.js";

export const createPasswordResetToken = async (
    email: string
) => {
    const user = await User.findOne({
        email: email.toLowerCase().trim(),
    });

    // Don't reveal whether an account exists.
    if (!user) {
        return null;
    }

    const token = generateRandomToken();

    await User.findByIdAndUpdate(user._id, {
        passwordResetTokenHash: hashToken(token),
        passwordResetExpiresAt: new Date(
            Date.now() + 15 * 60 * 1000
        ),
    });

    return {
        user,
        token,
    };
};

export const resetPassword = async (
    token: string,
    newPassword: string
) => {
    const tokenHash = hashToken(token);

    const user = await User.findOne({
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: {
            $gt: new Date(),
        },
    });

    if (!user) {
        throw new Error(
            "Invalid or expired password reset token"
        );
    }

    user.password = await hashPassword(newPassword);

    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;

    await user.save();
    await revokeAllUserSessions(
        user._id.toString()
    );

    return user;
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new Error("User not found");
  }

  const isValid = await comparePassword(
    currentPassword,
    user.password
  );

  if (!isValid) {
    throw new Error("Current password is incorrect");
  }

  if (currentPassword === newPassword) {
    throw new Error(
      "New password must be different from current password"
    );
  }

  user.password = await hashPassword(newPassword);

  await user.save();

  // Password change invalidates every existing session.
  await revokeAllUserSessions(userId);
};