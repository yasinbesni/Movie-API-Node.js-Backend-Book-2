import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { requireVerifiedEmail } from "../middlewares/requireVerifiedEmail.js";
import { validateBody } from "../middlewares/validateBody.js";
import { supportRateLimit } from "../middlewares/supportRateLimit.js";
import { supportRequestSchema } from "../validation/support.js";
import { submitSupportRequestController } from "../controllers/support.js";

const router = Router();

router.post(
  "/requests",
  authenticate,
  requireVerifiedEmail,
  supportRateLimit,
  validateBody(supportRequestSchema),
  submitSupportRequestController,
);

export default router;
