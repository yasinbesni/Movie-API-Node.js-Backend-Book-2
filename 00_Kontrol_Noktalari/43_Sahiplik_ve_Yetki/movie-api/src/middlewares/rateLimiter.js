import { rateLimit } from "express-rate-limit";

import { env } from "../config/env.js";

export const apiRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  limit: env.rateLimitLimit,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message:
      "Çok fazla Request gönderdiniz. Lütfen biraz sonra tekrar deneyin.",
  },
});
