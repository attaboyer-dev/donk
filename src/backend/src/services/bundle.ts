import { RedisClientType } from "redis";
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
  redis: RedisClientType,
  publisher: RedisClientType,
): ServiceBundle => {
  return {
    eventRelayService: new EventRelayService(publisher),
    gameService: new GameService(),
    gameStateService: new GameStateService(redis),
    handService: new HandService(),
    userService: new UserService(),
  };
};
