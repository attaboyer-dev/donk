import { RedisClientType } from "redis";

const FULL_DECK = [
  "As",
  "2s",
  "3s",
  "4s",
  "5s",
  "6s",
  "7s",
  "8s",
  "9s",
  "Ts",
  "Js",
  "Qs",
  "Ks",
  "Ac",
  "2c",
  "3c",
  "4c",
  "5c",
  "6c",
  "7c",
  "8c",
  "9c",
  "Tc",
  "Jc",
  "Qc",
  "Kc",
  "Ad",
  "2d",
  "3d",
  "4d",
  "5d",
  "6d",
  "7d",
  "8d",
  "9d",
  "Td",
  "Jd",
  "Qd",
  "Kd",
  "Ah",
  "2h",
  "3h",
  "4h",
  "5h",
  "6h",
  "7h",
  "8h",
  "9h",
  "Th",
  "Jh",
  "Qh",
  "Kh",
];

export class DeckService {
  private store: RedisClientType;

  constructor(redis: RedisClientType) {
    this.store = redis;
  }

  private async setDeck(handId: number, deck: string[]) {
    const key = `deck:${handId}`;
    await this.store.set(key, JSON.stringify(deck));
  }

  private async getDeck(handId: number) {
    await this.store.get(`deck:${handId}`);
  }
}
