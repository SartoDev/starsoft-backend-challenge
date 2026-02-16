import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMovieRequest } from './models/request/create-movie.request';
import { UpdateMovieRequest } from './models/request/update-movie.request';
import { MovieResponse } from './models/response/movie.response';

@Injectable()
export class MovieService {
  constructor(private readonly prismaService: PrismaService) {}

  async get() {
    const response = await this.prismaService.movie.findMany();
    return response.map((movie) => new MovieResponse(movie));
  }

  async findById(id: string) {
    const movie = await this.prismaService.movie.findUnique({
      where: {
        id,
      },
    });
    if (!movie) {
      Logger.error(`Movie not found with id: ${id}`, 'MovieService');
      throw new NotFoundException('Movie not found');
    }
    return new MovieResponse(movie);
  }

  async create(createMovieRequest: CreateMovieRequest) {
    await this.movieAlreadyExists(createMovieRequest.title);
    const movie = await this.prismaService.movie.create({
      data: createMovieRequest,
    });
    return new MovieResponse(movie);
  }

  async update(id: string, updateMovieRequest: UpdateMovieRequest) {
    await this.findById(id);
    const movie = await this.prismaService.movie.update({
      where: {
        id,
      },
      data: updateMovieRequest,
    });
    return new MovieResponse(movie);
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prismaService.movie.delete({
      where: {
        id,
      },
    });
    return { message: 'Movie deleted successfully' };
  }

  private async movieAlreadyExists(title: string) {
    const movie = await this.prismaService.movie.findUnique({
      where: {
        title,
      },
    });
    if (movie) {
      Logger.error(`Movie with this title already exists: ${title}`, 'MovieService');
      throw new ConflictException('Movie already exists');
    }
  }
}
