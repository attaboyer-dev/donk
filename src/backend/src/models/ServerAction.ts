import { ServerEvent } from "@donk/utils";

export default class ServerAction {
  type: ServerEvent;
  update: any;
  nextState: any;

  constructor(type: ServerEvent, update: any, nextState: any) {
    this.type = type;
    this.update = update;
    this.nextState = nextState;
  }
}
