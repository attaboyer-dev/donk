import { RedisClientType } from "redis";
import { ServiceBundle } from "./services/bundle";

export interface AppContext {
  services: ServiceBundle;
  redis: RedisClientType;
  pub: RedisClientType;
  sub: RedisClientType;
}
