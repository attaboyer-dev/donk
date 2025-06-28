export default class ServerAction {
  source: any;
  type: any;
  update: any;
  nextState: any;

  constructor(type: any, update: any, nextState: any) {
    this.source = "SERVER";
    this.type = type;
    this.update = update;
    this.nextState = nextState;
  }
}
