import { ServerEvent } from "../enums";

export type ServerMessage = {
  type: ServerEvent;
  update: any;
  nextState?: any;
};
