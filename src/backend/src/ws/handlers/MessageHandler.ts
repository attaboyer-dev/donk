import { IdentifyableWebSocket } from "../../types/IdentifyableWebSocket";
import UserAction from "../../models/UserAction";
import { GameActionProcessor } from "./GameActionProcessor";
import { HandActionProcessor } from "./HandActionProcessor";
import { AppContext } from "../../types/AppContext";

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
  }
}
