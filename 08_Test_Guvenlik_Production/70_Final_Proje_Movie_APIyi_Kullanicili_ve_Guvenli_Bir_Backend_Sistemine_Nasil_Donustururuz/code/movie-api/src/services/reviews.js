import mongoose from "mongoose";
import { Review } from "../db/models/review.js";

export const getMovieRatingStats = async (movieId) => {
  if (!mongoose.isObjectIdOrHexString(movieId)) {
    const error = new Error("Geçersiz film kimliği.");
    error.status = 400;
    throw error;
  }

  const [result] = await Review.aggregate([
    { $match: { movieId: new mongoose.Types.ObjectId(movieId) } },
    {
      $group: {
        _id: "$movieId",
        ratingAverage: { $avg: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  return result
    ? { ratingAverage: result.ratingAverage, ratingCount: result.ratingCount }
    : { ratingAverage: null, ratingCount: 0 };
};


import { Movie } from "../db/models/movie.js";
export const createReview = async (userId, movieId, payload) => {
 if (!await Movie.exists({ _id: movieId })) { const error = new Error("Film bulunamadı."); error.status = 404; throw error; }
 return Review.create({ userId, movieId, rating: payload.rating, text: payload.text });
};
