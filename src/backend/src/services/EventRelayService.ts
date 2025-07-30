import { ServerMessage } from "@donk/shared";
import { RedisClientType } from "redis";

export class EventRelayService {
  private publisher: RedisClientType;
  private subscriber: RedisClientType;

  constructor(publisher: RedisClientType, subscriber: RedisClientType) {
    this.publisher = publisher;
    this.subscriber = subscriber;
  }

  async publishGameEvent(gameId: number, event: ServerMessage) {
    await this.publisher.publish(`game-events:${gameId}`, JSON.stringify(event));
  }

  async subscribeToGameEvents(gameId: number, messageHandler: (message: string) => Promise<void>) {
    await this.subscriber.subscribe(`game-events:${gameId}`, messageHandler);
  }

  async unsubscribeFromGameEvents(
    gameId: number,
    messageHandler: (message: string) => Promise<void>,
  ) {
    await this.subscriber.unsubscribe(`game-events:${gameId}`, messageHandler);
  }
}
