import mongoose from "mongoose";

import { initMongoConnection } from "../db/initMongoConnection.js";
import { Movie } from "../db/models/movie.js";

const createMovie = async () => {
  try {
    await initMongoConnection();

    const movie = new Movie({
      title: "Interstellar",
      releaseYear: 2014,
      voteAverage: 8.7,
    });

    console.log("Kaydetmeden önce:");
    console.log(movie);

    await movie.save();

    console.log("Film başarıyla MongoDB'ye kaydedildi.");
  } catch (error) {
    console.error("Film kaydedilemedi:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

createMovie();