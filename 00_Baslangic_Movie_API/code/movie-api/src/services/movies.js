import { Movie } from "../db/models/movie.js";

import {
  calculatePaginationData,
} from "../utils/calculatePaginationData.js";
import {
  buildMovieFilter,
} from "../utils/buildMovieFilter.js";
import {
  parsePaginationParams,
} from "../utils/parsePaginationParams.js";

export const getMoviesService = async (query) => {
  const {
    page,
    limit,
  } = parsePaginationParams(query);

  const {
    filter,
    error,
  } = buildMovieFilter(query);

  if (error !== null) {
    return {
      error,
      movies: null,
      meta: null,
    };
  }

  const skip = (page - 1) * limit;

  const countQuery =
    Movie.countDocuments(filter);

  const moviesQuery = Movie.find(filter)
    .forMovieList()
    .populate({
      path: "director",
      select: {
        name: 1,
        _id: 0,
      },
    })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalItems = await countQuery.exec();
  const movies = await moviesQuery.exec();

  const {
    totalPages,
    hasNext,
    hasPrevious,
  } = calculatePaginationData(
    totalItems,
    limit,
    page,
  );

  return {
    error: null,
    movies,
    meta: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNext,
      hasPrevious,
    },
  };
};

export const getMovieByIdService = async (
  movieId,
) => {
  return Movie.findById(movieId)
    .populate({
      path: "director",
      select: {
        name: 1,
        birthYear: 1,
        country: 1,
        _id: 0,
      },
    })
    .exec();
};

export const createMovieService = async (
  payload,
) => {
  const movie = new Movie(payload);

  await movie.save();

  return movie;
};

export const updateMovieByIdService = async (
  movieId,
  payload,
) => {
  return Movie.findByIdAndUpdate(
    movieId,
    {
      $set: payload,
    },
    {
      returnDocument: "after",
    },
  ).exec();
};

export const deleteMovieByIdService = async (
  movieId,
) => {
  return Movie.findByIdAndDelete(movieId).exec();
};
