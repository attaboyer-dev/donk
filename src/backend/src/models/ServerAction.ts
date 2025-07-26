import { ServerEvent } from "src/shared/src";

export type ServerAction = {
  type: ServerEvent;
  update: any;
  nextState?: any;
};
