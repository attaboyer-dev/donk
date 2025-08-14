import { RedisClientType } from "redis";
import { EventRelayService } from "./EventRelayService";
import { GameService } from "./GameService";
import { GameStateService } from "./GameStateService";
import { HandService } from "./HandService";
import { UserService } from "./UserService";
import { TableService } from "./TableService";
import { DealerService } from "./DealerService";

export type ServiceBundle = {
  dealerService: DealerService;
  eventRelayService: EventRelayService;
  handService: HandService;
  gameService: GameService;
  gameStateService: GameStateService;
  tableService: TableService;
  userService: UserService;
};

export const initServices = (
  store: RedisClientType,
  publisher: RedisClientType,
  subscriber: RedisClientType,
): ServiceBundle => {
  return {
    dealerService: new DealerService(store),
    eventRelayService: new EventRelayService(store, publisher, subscriber),
    handService: new HandService(),
    gameService: new GameService(),
    gameStateService: new GameStateService(store),
    tableService: new TableService(),
    userService: new UserService(),
  };
};
