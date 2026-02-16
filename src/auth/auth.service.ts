import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginRequest } from './models/request/login.request';
import { SignupRequest } from './models/request/signup.request';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload';
import { LoginResponse } from './models/response/login.response';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginRequest: LoginRequest) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: loginRequest.email },
      });
      if (user === null || !bcrypt.compareSync(loginRequest.password, user.passwordHash)) {
        throw new UnauthorizedException('Invalid email or password');
      }
      return new LoginResponse(user);
    } catch (error) {
      throw error;
    }
  }

  async signup(signupRequest: SignupRequest) {
    try {
      await this.checkExistingUser(signupRequest.email);
      const response = await this.prisma.user.create({
        data: {
          email: signupRequest.email,
          passwordHash: bcrypt.hashSync(signupRequest.password, 10),
          fullName: signupRequest.fullName,
        },
      });
      return { message: 'Signup successful', user: new LoginResponse(response) };
    } catch (error) {
      throw error;
    }
  }

  async checkExistingUser(email: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async generateAccessToken(payload: JwtPayload): Promise<string> {
    try {
      const newAccessToken = this.jwtService.sign(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '24h',
      });

      return newAccessToken;
    } catch (error) {
      Logger.error('Error generating access token', error);
      throw new Error('Error generating access token');
    }
  }

  async generateRefreshToken(payload: JwtPayload): Promise<string> {
    try {
      const newRefreshToken = this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      });

      return newRefreshToken;
    } catch (error) {
      Logger.error('Error generating refresh token', error);
      throw new Error('Error generating refresh token');
    }
  }
}
