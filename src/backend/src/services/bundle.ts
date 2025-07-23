import { RedisClientType } from "redis";
import { GameService } from "./GameService";
import { GameStateService } from "./GameStateService";
import { HandService } from "./HandService";
import { UserService } from "./UserService";

export type ServiceBundle = {
  gameService: GameService;
  gameStateService: GameStateService;
  handService: HandService;
  userService: UserService;
};

export const initServices = (redis: RedisClientType): ServiceBundle => {
  return {
    gameService: new GameService(),
    gameStateService: new GameStateService(redis),
    handService: new HandService(),
    userService: new UserService(),
  };
};
