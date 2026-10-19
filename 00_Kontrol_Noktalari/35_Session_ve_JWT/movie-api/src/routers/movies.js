import express from "express";

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
  validateBody(createMovieSchema),
  createMovie,
);

router.patch(
  "/:movieId",
  validateBody(updateMovieSchema),
  updateMovieById,
);

router.delete("/:movieId", deleteMovieById);

export default router;
