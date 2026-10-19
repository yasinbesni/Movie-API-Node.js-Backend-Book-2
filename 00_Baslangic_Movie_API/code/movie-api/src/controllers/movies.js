import mongoose from "mongoose";

import {
  createMovieService,
  deleteMovieByIdService,
  getMovieByIdService,
  getMoviesService,
  updateMovieByIdService,
} from "../services/movies.js";

export const getMovies = async (req, res) => {
  const {
    error,
    movies,
    meta,
  } = await getMoviesService(req.query);

  if (error !== null) {
    return res.status(400).json({
      message: error,
    });
  }

  return res.status(200).json({
    message: "Filmler getirildi.",
    data: movies,
    meta,
  });
};

export const getMovieById = async (
  req,
  res,
) => {
  const { movieId } = req.params;

  if (!mongoose.isObjectIdOrHexString(movieId)) {
    return res.status(400).json({
      message: "Geçersiz film kimliği.",
    });
  }

  const movie =
    await getMovieByIdService(movieId);

  if (movie === null) {
    return res.status(404).json({
      message: "Film bulunamadı.",
    });
  }

  return res.status(200).json({
    message: "Film getirildi.",
    data: movie,
  });
};

export const createMovie = async (req, res) => {
  const movie =
    await createMovieService(req.body);

  return res.status(201).json({
    message: "Film oluşturuldu.",
    data: movie,
  });
};

export const updateMovieById = async (
  req,
  res,
) => {
  const { movieId } = req.params;

  if (!mongoose.isObjectIdOrHexString(movieId)) {
    return res.status(400).json({
      message: "Geçersiz film kimliği.",
    });
  }

  const updatedMovie =
    await updateMovieByIdService(
      movieId,
      req.body,
    );

  if (updatedMovie === null) {
    return res.status(404).json({
      message: "Film bulunamadı.",
    });
  }

  return res.status(200).json({
    message: "Film güncellendi.",
    data: updatedMovie,
  });
};

export const deleteMovieById = async (
  req,
  res,
) => {
  const { movieId } = req.params;

  if (!mongoose.isObjectIdOrHexString(movieId)) {
    return res.status(400).json({
      message: "Geçersiz film kimliği.",
    });
  }

  const deletedMovie =
    await deleteMovieByIdService(movieId);

  if (deletedMovie === null) {
    return res.status(404).json({
      message: "Film bulunamadı.",
    });
  }

  return res.status(200).json({
    message: "Film silindi.",
    data: deletedMovie,
  });
};
