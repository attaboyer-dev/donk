import { UserEvent } from "@donk/shared";
import { AppContext, IdentifyableWebSocket } from "@donk/backend-core";
import UserAction from "../../models/UserAction";

export class HandActionProcessor {
  constructor(private appContext: AppContext) {}

  async processAction(userAction: UserAction, wsc: IdentifyableWebSocket): Promise<void> {
    switch (userAction.type) {
      case UserEvent.Fold:
        // TODO: Gameplay action
        break;

      case UserEvent.Check:
        // TODO: Gameplay action
        break;

      case UserEvent.Call:
        // TODO: Gameplay action
        break;

      case UserEvent.Raise:
        // TODO: Gameplay action
        break;

      case UserEvent.Show:
        // TODO: Gameplay action
        break;

      default:
        console.log("Unexpected event");
    }
  }
}
