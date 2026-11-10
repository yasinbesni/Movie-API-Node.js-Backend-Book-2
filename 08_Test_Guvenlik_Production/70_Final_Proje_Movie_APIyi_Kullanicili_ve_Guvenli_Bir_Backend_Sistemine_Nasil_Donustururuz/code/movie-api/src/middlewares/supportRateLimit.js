import { rateLimit } from "express-rate-limit";

export const supportRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  keyGenerator: (req) => req.user._id.toString(),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Çok sık yardım talebi gönderildi. Daha sonra deneyin." },
});
