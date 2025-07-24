import { RedisClientType, createClient } from "redis";
import { EventRelayService } from "./EventRelayService";
import { GameService } from "./GameService";
import { GameStateService } from "./GameStateService";
import { HandService } from "./HandService";
import { UserService } from "./UserService";

export type ServiceBundle = {
  eventRelayService: EventRelayService;
  gameService: GameService;
  gameStateService: GameStateService;
  handService: HandService;
  userService: UserService;
};

export const initServices = (
  store: RedisClientType,
  publisher: RedisClientType,
  subscriber: RedisClientType,
): ServiceBundle => {
  return {
    eventRelayService: new EventRelayService(publisher, subscriber),
    gameService: new GameService(),
    gameStateService: new GameStateService(store),
    handService: new HandService(),
    userService: new UserService(),
  };
};
