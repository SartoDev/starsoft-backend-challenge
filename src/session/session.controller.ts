import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { SessionService } from './session.service';
import { CreateSessionRequest } from './models/request/create-session.request';
import { UpdateSessionRequest } from './models/request/update-session.request';
import { AuthCookieGuardion } from 'src/common/guards/auth-cookie.guard';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Session')
@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  get() {
    return this.sessionService.get();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.sessionService.findById(id);
  }

  @Post()
  @UseGuards(AuthCookieGuardion)
  @ApiBody({ type: CreateSessionRequest })
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  create(@Body() createSessionRequest: CreateSessionRequest) {
    return this.sessionService.create(createSessionRequest);
  }

  @Put(':id')
  @UseGuards(AuthCookieGuardion)
  @ApiBody({ type: UpdateSessionRequest })
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  update(@Param('id') id: string, @Body() updateSessionRequest: UpdateSessionRequest) {
    return this.sessionService.update(id, updateSessionRequest);
  }

  @Delete(':id')
  @UseGuards(AuthCookieGuardion)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  delete(@Param('id') id: string) {
    return this.sessionService.delete(id);
  }
}
