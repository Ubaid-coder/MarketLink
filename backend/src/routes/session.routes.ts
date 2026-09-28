import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";

import {
  getSessionsController,
  revokeSessionController,
  revokeAllSessionsController,
} from "../controllers/session.controller.js";

const router = Router();

router.use(protect);

router.get("/", getSessionsController);

router.delete(
  "/:sessionId",
  revokeSessionController
);

router.delete(
  "/",
  revokeAllSessionsController
);

export  {router as sessionRoutes};