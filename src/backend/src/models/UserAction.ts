import { UserEvent } from "src/shared/src";

export default class UserAction {
  type: UserEvent;
  value: any;
  constructor(sourcename: string, payload: any) {
    let json = JSON.parse(payload);
    this.type = json.type;
    this.value = json.val;
  }
}
