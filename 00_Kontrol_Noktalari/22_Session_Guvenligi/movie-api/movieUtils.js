import { movies } from "./movieData.js";

export const getMovieCount = (movies) => {
  return movies.length;
};

export const getFirstMovie = (movies) => {
  return movies[0];
};