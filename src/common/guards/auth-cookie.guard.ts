import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
  CanActivate,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

export const AuthCookieGuard = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();
    const accessToken = req.signedCookies?.['access_token'];

    if (!accessToken) {
      throw new UnauthorizedException('Token not found');
    }

    return accessToken;
  },
);

@Injectable()
export class AuthCookieGuardion implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies['access_token'];

    if (!token) throw new UnauthorizedException('Token not found');

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      request['user'] = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
