import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller('health-check')
export class AppController {

  @Get()
  @HttpCode(200)
  healthCheck() {}
}
