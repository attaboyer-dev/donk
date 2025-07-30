import { UserEvent } from "@donk/shared";
import { IdentifyableWebSocket } from "../../types/IdentifyableWebSocket";
import UserAction from "../../models/UserAction";
import { AppContext } from "../../types/AppContext";

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
