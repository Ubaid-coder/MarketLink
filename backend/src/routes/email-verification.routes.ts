import { Router } from "express";
import {
  verifyEmailController,
} from "../controllers/email-verification.controller.js";

const router = Router();

router.get(
  "/verify",
  verifyEmailController
);

export { router as emailVerificationRoutes};