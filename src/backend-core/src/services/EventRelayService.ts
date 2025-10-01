import { ServerMessage } from "@donk/shared";
import { RedisClientType } from "redis";
import { DEALER_EVENT_STREAM } from "../utils/consts";
import { HandEvent } from "../types/HandEvent";

/**
 * This service is responsible for relaying events across various backend layers,
 * leveraging Redis as an intermediary message broker
 */
export class EventRelayService {
  private store: RedisClientType;
  private publisher: RedisClientType;
  private subscriber: RedisClientType;

  constructor(store: RedisClientType, publisher: RedisClientType, subscriber: RedisClientType) {
    this.store = store;
    this.publisher = publisher;
    this.subscriber = subscriber;
  }

  async publishGameEvent(gameId: number, event: ServerMessage) {
    console.log("publishing message %o", event);
    await this.publisher.publish(`game-events:${gameId}`, JSON.stringify(event));
  }

  async subscribeToGameEvents(gameId: number, handler: (message: string) => Promise<void>) {
    await this.subscriber.subscribe(`game-events:${gameId}`, handler);
  }

  async unsubscribeFromGameEvents(gameId: number, handler: (message: string) => Promise<void>) {
    await this.subscriber.unsubscribe(`game-events:${gameId}`, handler);
  }

  async publishHandEvent(event: HandEvent, timeout?: number) {
    if (timeout) {
      setTimeout(async () => {
        await this.store.xAdd(DEALER_EVENT_STREAM, "*", event);
      }, timeout);
    } else {
      await this.store.xAdd(DEALER_EVENT_STREAM, "*", event);
    }
  }

  async publishTimeoutEvent(event: any, ms: number) {
    await this.store.zAdd("timeouts", [{ score: Date.now() + ms, value: event }]);
  }
}
