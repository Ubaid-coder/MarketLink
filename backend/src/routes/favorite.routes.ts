import { Router } from "express";

import {
  getFavorites,
  toggleFavoriteProduct,
  toggleFavoriteFarmer,
} from "../controllers/favorite.controller.js";

import {
  protect,
  authorize,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(
  protect,
  authorize("customer")
);

router.get(
  "/",
  getFavorites
);

router.patch(
  "/products/:productId",
  toggleFavoriteProduct
);

router.patch(
  "/farmers/:farmerId",
  toggleFavoriteFarmer
);

export default router;