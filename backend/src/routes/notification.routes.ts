import { Router } from "express";

import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notification.controller.js";

import {
  protect,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

router.get(
  "/",
  getMyNotifications
);

router.patch(
  "/read-all",
  markAllNotificationsRead
);

router.patch(
  "/:id/read",
  markNotificationRead
);

export default router;