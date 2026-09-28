import { Router } from "express";

import {
  createProduct,
  getMyProducts,
  getMyProductById,
  updateProduct,
  updateProductStatus,
  resetWeeklyStock,
  deleteProduct,
} from "../controllers/product.controller.js";

import {
  protect,
  authorize,
} from "../middlewares/auth.middleware.js";
import { requireApprovedFarmer } from "../controllers/farmer.controller.js";

const router = Router();


// ======================================================
// FARMER PRODUCT MANAGEMENT
// ======================================================

router.use(
  protect,
  authorize("farmer")
);

router.post(
  "/",
  createProduct
);

router.get(
  "/mine",
  getMyProducts
);

router.get(
  "/mine/:id",
  getMyProductById
);

router.patch(
  "/:id",
  updateProduct
);

router.patch(
  "/:id/status",
  updateProductStatus
);

router.patch(
  "/:id/reset-weekly-stock",
  resetWeeklyStock
);

router.delete(
  "/:id",
  deleteProduct
);

export default router;