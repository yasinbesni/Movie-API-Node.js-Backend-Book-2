import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { getCurrentUser } from "../controllers/users.js";

const router = Router();
router.get("/me", authenticate, getCurrentUser);

export default router;
