import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  async setSeatLock(params: {
    sessionId: string;
    seatId: string;
    userId: string;
    ttlSeconds: number;
  }) {
    const key = `pre-reservation:${params.sessionId}:${params.seatId}`;

    const result = await this.redis.set(
      key,
      params.userId,
      'EX',
      params.ttlSeconds,
      'NX',
    );

    return result === 'OK';
  }

  async getSeatLock(sessionId: string, seatId: string) {
    const key = `pre-reservation:${sessionId}:${seatId}`;
    return this.redis.get(key);
  }

  async releaseSeatLock(sessionId: string, seatId: string) {
    const key = `pre-reservation:${sessionId}:${seatId}`;
    return this.redis.del(key);
  }
}
