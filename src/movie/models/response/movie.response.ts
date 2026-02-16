import { Movie } from "generated/prisma/client";

export class MovieResponse {
  id: string;
  title: string;
  releaseYear: number;
  genre: string;

  constructor(movie: Movie) {
    this.id = movie.id;
    this.title = movie.title;
    this.releaseYear = movie.releaseYear;
    this.genre = movie.genre;
  }
}
