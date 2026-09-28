import { User } from "../models/user.model.js";
import {
  generateVerificationToken,
  hashToken,
} from "../utils/token.js";

export const createEmailVerificationToken = async (
  userId: string
) => {
  const token = generateVerificationToken();

  await User.findByIdAndUpdate(userId, {
    emailVerificationTokenHash: hashToken(token),
    emailVerificationExpiresAt: new Date(
      Date.now() + 15 * 60 * 1000
    ),
  });

  return token;
};

export const verifyEmail = async (token: string) => {
  const tokenHash = hashToken(token);

  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpiresAt: {
      $gt: new Date(),
    },
  });

  if (!user) {
    throw new Error(
      "Invalid or expired verification token"
    );
  }

  user.emailVerifiedAt = new Date();
  user.emailVerificationTokenHash = null;
  user.emailVerificationExpiresAt = null;

  await user.save();

  return user;
};