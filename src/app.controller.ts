import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller('health-check')
export class AppController {
  @Get('health-check')
  @ApiOperation({
    summary: 'Health Check',
    description: 'Check the system status',
  })
  @HttpCode(200)
  healthCheck(): string {
    return 'Application is healthy';
  }
}
