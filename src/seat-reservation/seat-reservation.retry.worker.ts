import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

@Controller()
export class SeatReservationRetryWorker {
  constructor(
    @Inject('KAFKA_SERVICE')
    private readonly kafka: ClientKafka,
  ) {}

  @EventPattern('seat.pre-reservation.retry')
  async handle(@Payload() message: any) {
    const event = message.value;

    await new Promise((r) => setTimeout(r, 1000 * event.attempt));

    this.kafka.emit('seat.pre-reservation.requested', {
      key: event.sessionId,
      value: event,
    });
  }
}
