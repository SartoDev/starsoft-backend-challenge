import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from 'src/auth/jwt-payload';

export const Usr = createParamDecorator(async (data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<Request>();
  const accessToken = req.cookies['access_token'];

  if (!accessToken) {
    throw new UnauthorizedException('Access token not found');
  }
  const payload: JwtPayload = new JwtService({
    secret: process.env.JWT_ACCESS_SECRET,
    signOptions: {
      expiresIn: '24h',
    },
  }).verify(accessToken);

  if (!payload) {
    throw new UnauthorizedException('Invalid access token');
  }

  return payload;
});
