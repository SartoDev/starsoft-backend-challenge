import { Body, Controller, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest } from './models/request/login.request';
import { SignupRequest } from './models/request/signup.request';
import { JwtPayload } from './jwt-payload';
import type { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  async login(@Body() loginRequest: LoginRequest, @Res() res: Response) {
    const user = await this.authService.login(loginRequest);
    const jwtPayload: JwtPayload = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
    const accessToken = await this.authService.generateAccessToken(jwtPayload);
    const refreshToken = await this.authService.generateRefreshToken(jwtPayload);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.SECURE === 'true',
      sameSite: process.env.SAME_SITE as 'lax' | 'strict' | 'none',
      signed: process.env.SIGNED === 'true',
      path: '/api/auth/refresh',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.SECURE === 'true',
      sameSite: process.env.SAME_SITE as 'lax' | 'strict' | 'none',
      signed: process.env.SIGNED === 'true',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24,
    });

    return res.json(user);
  }

  @Post('signup')
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  signup(@Body() signupRequest: SignupRequest) {
    return this.authService.signup(signupRequest);
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const payload = await this.authService.verifyRefreshToken(refreshToken);

    const accessToken = await this.authService.generateAccessToken({
      email: payload.email,
      id: payload.id,
      fullName: payload.fullName,
      role: payload.role,
    });

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.SECURE === 'true',
      sameSite: process.env.SAME_SITE as 'lax' | 'strict' | 'none',
      signed: process.env.SIGNED === 'true',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24,
    });

    return res.json({ message: 'Generated new access token' });
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.SECURE === 'true',
      sameSite: process.env.SAME_SITE as 'lax' | 'strict' | 'none',
      signed: process.env.SIGNED === 'true',
      path: '/api/auth/refresh',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
    return res.json({ message: 'Logout successful' });
  }
}
