import { RedisClientType } from "redis";

export class DealerService {
  private redis: RedisClientType;

  constructor(redis: RedisClientType) {
    this.redis = redis;
  }

  // This is a one-time setup for the dealer service
  async createDealerGroup() {
    try {
      await this.redis.xGroupCreate("hand-events", "dealers", "$", { MKSTREAM: true });
      console.log(`Consumer group "dealers" created`);
    } catch (err) {
      if (err instanceof Error && err.message.includes("BUSYGROUP")) {
        console.log(`Consumer group "dealers" already exists`);
      } else {
        throw err;
      }
    }
  }

}
