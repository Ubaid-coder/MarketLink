import { Router } from "express";

import {
  createProductReview,
  getProductReviews,
  getFarmerReviews,
  respondToReview,
  toggleReviewVisibility,
} from "../controllers/review.controller.js";

import {
  protect,
  authorize,
} from "../middlewares/auth.middleware.js";

const router = Router();


// PUBLIC
router.get(
  "/product/:productId",
  getProductReviews
);

router.get(
  "/farmer/:farmerId",
  getFarmerReviews
);


// CUSTOMER
router.post(
  "/",
  protect,
  authorize("customer"),
  createProductReview
);


// FARMER
router.patch(
  "/:id/respond",
  protect,
  authorize("farmer"),
  respondToReview
);


// ADMIN
router.patch(
  "/:id/visibility",
  protect,
  authorize("admin"),
  toggleReviewVisibility
);


export default router;