import { isValidObjectId } from "mongoose";
import {
  addToWatchlist,
  getMyWatchlist,
  removeFromWatchlist,
} from "../services/watchlist.js";

const badRequest = (message) => {
  const error = new Error(message);
  error.status = 400;
  return error;
};

const requireMovieId = (movieId) => {
  if (!isValidObjectId(movieId)) {
    throw badRequest("Geçerli bir film kimliği gönderin.");
  }
  return movieId;
};

export const addWatchlistItem = async (req, res) => {
  const movieId = requireMovieId(req.params.movieId);
  try {
    const item = await addToWatchlist(req.user._id, movieId);
    return res.status(201).json({ data: item });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "Bu film izleme listenizde zaten var.",
      });
    }
    throw error;
  }
};

export const listMyWatchlist = async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  if (!Number.isSafeInteger(page) || page < 1 ||
      !Number.isSafeInteger(limit) || limit < 1 || limit > 50) {
    throw badRequest("Sayfa ve kayıt sayısı geçersiz.");
  }
  const result = await getMyWatchlist(req.user._id, { page, limit });
  return res.status(200).json({ data: result.items, total: result.total });
};

export const deleteWatchlistItem = async (req, res) => {
  const movieId = requireMovieId(req.params.movieId);
  const item = await removeFromWatchlist(req.user._id, movieId);
  if (!item) {
    const error = new Error("İzleme listesi kaydı bulunamadı.");
    error.status = 404;
    throw error;
  }
  return res.status(204).send();
};
