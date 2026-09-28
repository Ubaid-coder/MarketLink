import { Router } from "express";

import {
  getAllFarmers,
  getFarmerById,
  approveFarmer,
  suspendFarmer,

  getAdminDashboard,
  getCustomers,
  toggleCustomerStatus,
  getAdminProducts,
  toggleProductStatus,
  getAdminReports,

  createAnnouncement,
  getAdminReviews,
  updateReviewVisibility,
} from "../controllers/admin.controller.js";


import {
  protect,
  authorize,
} from "../middlewares/auth.middleware.js";

const router = Router();


router.use(
  protect,
  authorize("admin")
);


// DASHBOARD

router.get(
  "/dashboard",
  getAdminDashboard
);

router.get(
  "/reports",
  getAdminReports
);


// FARMERS

router.get(
  "/farmers",
  getAllFarmers
);

router.get(
  "/farmers/:id",
  getFarmerById
);

router.patch(
  "/farmers/:id/approve",
  approveFarmer
);

router.patch(
  "/farmers/:id/suspend",
  suspendFarmer
);


// CUSTOMERS

router.get(
  "/customers",
  getCustomers
);

router.patch(
  "/customers/:id/status",
  toggleCustomerStatus
);


// PRODUCTS

router.get(
  "/products",
  getAdminProducts
);

router.patch(
  "/products/:id/status",
  toggleProductStatus
);


// ANNOUNCEMENTS

router.post(
  "/announcements",
  createAnnouncement
);

router.get(
  "/reviews",
  getAdminReviews
);

router.patch(
  "/:id/visibility",
  updateReviewVisibility
);

router.post(
  "/announcements",
  createAnnouncement
);

export default router;