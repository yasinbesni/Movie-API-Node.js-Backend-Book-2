import { WatchlistItem } from "../db/models/watchlistItem.js";
import { Movie } from "../db/models/movie.js";

export const addToWatchlist = async (
  userId,
  movieId,
) => {
  const movieExists = await Movie.exists({
    _id: movieId,
  });

  if (!movieExists) {
    const error = new Error("Film bulunamadı.");
    error.status = 404;
    throw error;
  }

  return WatchlistItem.create({
    userId,
    movieId,
  });
};
export const getMyWatchlist = async (
  userId,
  { page = 1, limit = 20 },
) => {
  const skip = (page - 1) * limit;

  const filter = { userId };

  const [items, total] = await Promise.all([
    WatchlistItem.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("movieId"),
    WatchlistItem.countDocuments(filter),
  ]);

  return { items, total };
};
export const removeFromWatchlist = async (
  userId,
  movieId,
) => {
  return WatchlistItem.findOneAndDelete({
    userId,
    movieId,
  });
};
