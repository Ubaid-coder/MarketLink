import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const verifyEmailTransport = async (): Promise<void> => {
  await transporter.verify();
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const resetUrl =
    `${env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: email,
    subject: "Reset your password",
    html: `
      <div>
        <h2>Password Reset</h2>

        <p>
          We received a request to reset your password.
        </p>

        <p>
          This link expires in 15 minutes.
        </p>

        <a href="${resetUrl}">
          Reset Password
        </a>

        <p>
          If you didn't request this, you can safely ignore
          this email.
        </p>
      </div>
    `,
  });
};