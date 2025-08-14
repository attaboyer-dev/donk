import { GameEvent } from "@donk/shared";

export type HandEvent = {
  action: GameEvent;
  payload: any;
};
