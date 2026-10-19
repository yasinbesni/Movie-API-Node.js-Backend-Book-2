import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { getCurrentUser } from "../controllers/users.js";
import { getMyMovies } from "../controllers/movies.js";

const router = Router();
router.get("/me", authenticate, getCurrentUser);
router.get("/me/movies", authenticate, getMyMovies);

export default router;
