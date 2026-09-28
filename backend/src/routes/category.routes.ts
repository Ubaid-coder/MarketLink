import { Router } from "express";

import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

import {
  protect,
  authorize,
} from "../middlewares/auth.middleware.js";

const router = Router();


// PUBLIC
router.get("/", getCategories);


// ADMIN
router.post(
  "/",
  protect,
  authorize("admin"),
  createCategory
);

router.patch(
  "/:id",
  protect,
  authorize("admin"),
  updateCategory
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteCategory
);

export default router;