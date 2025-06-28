import { UserEvent } from "@donk/utils";

export default class UserAction {
  source: any;
  type: UserEvent;
  value: any;
  constructor(sourcename: string, payload: any) {
    let json = JSON.parse(payload);
    this.source = sourcename;
    this.type = json.type;
    this.value = json.val;
  }
}
