import { RedisClientType } from "redis";
import { ServiceBundle } from "../services/bundle";

export interface AppContext {
  services: ServiceBundle;
  store?: RedisClientType;
}
