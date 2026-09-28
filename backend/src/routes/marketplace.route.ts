import { Router } from "express";

import {
  getMarketplaceProducts,
  getMarketplaceProductById,
  getMarketplaceFarmers,
  getMarketplaceFarmerById,
  getFarmersByMarket,
} from "../controllers/marketplace.controller.js";

const router = Router();


// PRODUCTS
router.get(
  "/products",
  getMarketplaceProducts
);

router.get(
  "/products/:id",
  getMarketplaceProductById
);


// FARMERS
router.get(
  "/farmers",
  getMarketplaceFarmers
);

router.get(
  "/farmers/:id",
  getMarketplaceFarmerById
);


// MARKET -> FARMERS
router.get(
  "/markets/:marketId/farmers",
  getFarmersByMarket
);


export default router;