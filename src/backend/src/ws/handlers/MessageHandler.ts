import { IdentifyableWebSocket } from "../../types/IdentifyableWebSocket";
import UserAction from "../../models/UserAction";
import { GameActionProcessor } from "./GameActionProcessor";
import { AppContext } from "../../context";

export class MessageHandler {
  private gameActionProcessor: GameActionProcessor;

  constructor(appContext: AppContext) {
    this.gameActionProcessor = new GameActionProcessor(appContext);
  }

  async handleMessage(wsc: IdentifyableWebSocket, data: any): Promise<void> {
    const userAction = new UserAction(wsc.name, data);
    console.log("User ID - %s - triggering %s", wsc.name, userAction);

    await this.gameActionProcessor.processAction(userAction, wsc);
  }
}
