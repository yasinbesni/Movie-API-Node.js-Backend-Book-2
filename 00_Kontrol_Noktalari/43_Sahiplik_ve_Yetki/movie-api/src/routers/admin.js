import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { requireRole } from "../middlewares/requireRole.js";

const router = Router();

router.get(
  "/access-check",
  authenticate,
  requireRole("admin"),
  (req, res) => {
    res.status(200).json({ data: { message: "Yönetici erişimi doğrulandı." } });
  },
);

export default router;
