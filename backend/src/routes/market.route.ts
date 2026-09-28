import { Router } from "express";

import {
  createMarket,
  getMarkets,
  getMarketById,
  updateMarket,
  deleteMarket,
} from "../controllers/market.controller.js";

import {
  protect,
  authorize,
} from "../middlewares/auth.middleware.js";

const router = Router();


// PUBLIC
router.get(
  "/",
  getMarkets
);

router.get(
  "/:id",
  getMarketById
);


// ADMIN
router.post(
  "/",
  protect,
  authorize("admin"),
  createMarket
);

router.patch(
  "/:id",
  protect,
  authorize("admin"),
  updateMarket
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteMarket
);


export default router;