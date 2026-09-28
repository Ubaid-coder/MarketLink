import { Router } from "express";

import {
  forgotPasswordController,
  resetPasswordController,
  changePasswordController,
} from "../controllers/password.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/forgot",
  forgotPasswordController
);

router.post(
  "/reset",
  resetPasswordController
);

router.post(
  "/change",
  protect,
  changePasswordController
);

export {router as passwordRoutes};