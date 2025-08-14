import { RedisClientType } from "redis";

export class DefaultActionService {
  private store: RedisClientType;

  constructor(redis: RedisClientType) {
    this.store = redis;
  }

  // This should be used to determine what the next action is
  async addDefaultAction(gameId: number) {
    await this.store.zAdd(`default-actions:${gameId}`, [
      {
        score: Date.now(),
        value: "",
      },
    ]);
  }

  async handleDefaultActions(gameId: number) {
    const defaultActions = await this.checkDefaultActions(gameId);
    const toProcess = Promise.all([this.store.zRem(`default-actions:${gameId}`, "")]);
  }

  async checkDefaultActions(gameId: number) {
    const defaultActions = await this.store.zRangeByScore(
      `default-actions:${gameId}`,
      0,
      Date.now(),
    );
    return defaultActions;
  }
}
