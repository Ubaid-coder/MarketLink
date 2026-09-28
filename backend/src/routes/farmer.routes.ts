import { Router } from "express";

import {
  getMyFarmerProfile,
  updateMyFarmerProfile,
  addMarketSchedule,
  updateMarketSchedule,
  removeMarketSchedule,
  getFarmerDashboard,
} from "../controllers/farmer.controller.js";

import {
  protect,
  authorize,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(
  protect,
  authorize("farmer")
);

router.get(
  "/dashboard",
  getFarmerDashboard
);


// PROFILE

router.get(
  "/me",
  getMyFarmerProfile
);

router.patch(
  "/me",
  updateMyFarmerProfile
);


// MARKET SCHEDULES

router.post(
  "/me/markets",
  addMarketSchedule
);

router.patch(
  "/me/markets/:marketId",
  updateMarketSchedule
);

router.delete(
  "/me/markets/:marketId",
  removeMarketSchedule
);


export default router;