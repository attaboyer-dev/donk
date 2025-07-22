import { GameService } from "./GameService";
import { HandService } from "./HandService";
import { UserService } from "./UserService";

export type ServiceBundle = {
  gameService: GameService;
  handService: HandService;
  userService: UserService;
};

export const initServices = (): ServiceBundle => {
  return {
    gameService: new GameService(),
    handService: new HandService(),
    userService: new UserService(),
  };
};
