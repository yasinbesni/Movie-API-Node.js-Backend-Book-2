import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import {
  addWatchlistItem,
  listMyWatchlist,
  deleteWatchlistItem,
} from "../controllers/watchlist.js";

const router = Router();
router.get("/", authenticate, listMyWatchlist);
router.post("/:movieId", authenticate, addWatchlistItem);
router.delete("/:movieId", authenticate, deleteWatchlistItem);
export default router;
