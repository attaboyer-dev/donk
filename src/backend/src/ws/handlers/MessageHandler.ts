import { AppContext, IdentifyableWebSocket } from "@donk/backend-core";
import UserAction from "../../models/UserAction";
import { GameActionProcessor } from "./GameActionProcessor";
import { HandActionProcessor } from "./HandActionProcessor";

export class MessageHandler {
  private gameActionProcessor: GameActionProcessor;
  private handActionProcessor: HandActionProcessor;

  constructor(appContext: AppContext) {
    this.gameActionProcessor = new GameActionProcessor(appContext);
    this.handActionProcessor = new HandActionProcessor(appContext);
  }

  async handleMessage(wsc: IdentifyableWebSocket, data: any): Promise<void> {
    const userAction = new UserAction(wsc.name, data);
    console.log("User ID - %s - triggering %s", wsc.name, userAction);

    await this.gameActionProcessor.processAction(userAction, wsc);
    await this.handActionProcessor.processAction(userAction, wsc);
  }
}
