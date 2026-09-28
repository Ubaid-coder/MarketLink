import { Router } from "express";

import {
  registerCustomer,
  registerFarmer,
  login,
  getMe,
} from "../controllers/auth.controller.js";

import {
  protect,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/register/customer",
  registerCustomer
);

router.post(
  "/register/farmer",
  registerFarmer
);

router.post(
  "/login",
  login
);

router.get(
  "/me",
  protect,
  getMe
);

export default router;