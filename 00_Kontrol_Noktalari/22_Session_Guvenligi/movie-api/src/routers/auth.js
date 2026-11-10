import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/auth.js";
import { validateBody } from "../middlewares/validateBody.js";
import {
  registerUserSchema,
  loginUserSchema,
} from "../validation/auth.js";

const router = Router();

router.post(
  "/register",
  validateBody(registerUserSchema),
  registerUser,
);

router.post(
  "/login",
  validateBody(loginUserSchema),
  loginUser,
);

router.post("/logout", logoutUser);

export default router;
