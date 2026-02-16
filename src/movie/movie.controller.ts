import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieRequest } from './models/request/create-movie.request';
import { ApiBody } from '@nestjs/swagger';
import { UpdateMovieRequest } from './models/request/update-movie.request';
import { AuthCookieGuardion } from 'src/common/guards/auth-cookie.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  get() {
    return this.movieService.get();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id') id: string) {
    return this.movieService.findById(id);
  }

  @Post()
  @UseGuards(AuthCookieGuardion)
  @ApiBody({ type: CreateMovieRequest })
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  create(@Body() createMovieRequest: CreateMovieRequest) {
    return this.movieService.create(createMovieRequest);
  }

  @Put(':id')
  @UseGuards(AuthCookieGuardion)
  @ApiBody({ type: UpdateMovieRequest })
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  update(@Param('id') id: string, @Body() updateMovieRequest: UpdateMovieRequest) {
    return this.movieService.update(id, updateMovieRequest);
  }

  @Delete(':id')
  @UseGuards(AuthCookieGuardion)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  delete(@Param('id') id: string) {
    return this.movieService.delete(id);
  }
}
