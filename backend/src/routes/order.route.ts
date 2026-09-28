import { Router } from "express";

import {
  createOrder,
  getMyOrders,
  getMyOrderById,
  cancelOrder,
  getFarmerOrders,
  updateOrderStatus,
  reorder,
  modifyOrder,
} from "../controllers/order.controller.js";

import {
  protect,
  authorize,
} from "../middlewares/auth.middleware.js";

const router = Router();


// ======================================================
// CUSTOMER
// ======================================================

router.post(
  "/",
  protect,
  authorize("customer"),
  createOrder
);

router.get(
  "/mine",
  protect,
  authorize("customer"),
  getMyOrders
);

router.get(
  "/mine/:id",
  protect,
  authorize("customer"),
  getMyOrderById
);

router.patch(
  "/mine/:id/cancel",
  protect,
  authorize("customer"),
  cancelOrder
);


// ======================================================
// FARMER
// ======================================================

router.get(
  "/farmer",
  protect,
  authorize("farmer"),
  getFarmerOrders
);

router.patch(
  "/farmer/:id/status",
  protect,
  authorize("farmer"),
  updateOrderStatus
);

router.patch(
  "/mine/:id",
  protect,
  authorize("customer"),
  modifyOrder
);

router.get(
  "/mine/:id/reorder",
  protect,
  authorize("customer"),
  reorder
);

export default router;