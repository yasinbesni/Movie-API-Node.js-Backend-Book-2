import mongoose from "mongoose";
import { createReview, getMovieRatingStats } from "../services/reviews.js";
export const postReview = async (req, res) => res.status(201).json({ data: await createReview(req.user._id, req.params.movieId, req.body) });
export const ratingStats = async (req, res) => res.json({ data: await getMovieRatingStats(req.params.movieId) });
export const validateMovieId = (req, res, next) => mongoose.isObjectIdOrHexString(req.params.movieId) ? next() : res.status(400).json({ message: "Geçersiz film kimliği." });
