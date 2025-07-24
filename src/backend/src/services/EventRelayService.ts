import { RedisClientType } from "redis";
import { ServerAction } from "../models/ServerAction";

export class EventRelayService {
  private publisher: RedisClientType;

  constructor(publisher: RedisClientType) {
    this.publisher = publisher;
  }

  async publishGameEvent(gameId: number, event: ServerAction) {
    await this.publisher.publish(
      `game-events:${gameId}`,
      JSON.stringify(event),
    );
  }
}
