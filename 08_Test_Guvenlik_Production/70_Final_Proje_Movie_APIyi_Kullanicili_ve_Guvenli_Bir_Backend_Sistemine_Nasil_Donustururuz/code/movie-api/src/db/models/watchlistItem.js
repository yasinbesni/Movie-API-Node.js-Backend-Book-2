import mongoose from "mongoose";

const watchlistItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

watchlistItemSchema.index({ userId: 1, movieId: 1 }, { unique: true });

export const WatchlistItem =
  mongoose.models.WatchlistItem ||
  mongoose.model("WatchlistItem", watchlistItemSchema);
