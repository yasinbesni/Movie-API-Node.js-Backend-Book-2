import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  loginUserWithToken,
  refreshSession,
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
  logoutUser,
  loginUserWithToken,
  refreshSession,
);

router.post("/logout", logoutUser);

router.post("/jwt/login", validateBody(loginUserSchema), loginUserWithToken);
router.post("/refresh", refreshSession);

export default router;
