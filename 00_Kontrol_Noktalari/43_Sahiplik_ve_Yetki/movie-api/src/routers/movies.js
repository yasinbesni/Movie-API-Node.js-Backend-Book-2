import express from "express";
import { authenticate } from "../middlewares/authenticate.js";

import {
  createMovie,
  deleteMovieById,
  getMovieById,
  getMovies,
  updateMovieById,
} from "../controllers/movies.js";

import {
  validateBody,
} from "../middlewares/validateBody.js";

import {
  createMovieSchema,
  updateMovieSchema,
} from "../validation/movieSchemas.js";

const router = express.Router();

router.get("/", getMovies);

router.get("/:movieId", getMovieById);

router.post(
  "/",
  authenticate,
  validateBody(createMovieSchema),
  createMovie,
);

router.patch(
  "/:movieId",
  authenticate,
  validateBody(updateMovieSchema),
  updateMovieById,
);

router.delete("/:movieId", authenticate, deleteMovieById);

export default router;
