import { ServerEvent } from "@donk/utils";

export type ServerAction = {
  type: ServerEvent;
  update: any;
  nextState?: any;
};
