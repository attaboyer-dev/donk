import { WebSocketServer } from "ws";
import { AppContext, IdentifyableWebSocket } from "@donk/backend-core";
import { WsContextServer } from "../types/WsContextServer";
import { ConnectionHandler } from "./handlers/ConnectionHandler";
import { MessageHandler } from "./handlers/MessageHandler";

export class WebSocketManager {
  private wss: WsContextServer;
  private connectionHandler: ConnectionHandler;
  private messageHandler: MessageHandler;

  constructor(appContext: AppContext, server: any) {
    this.wss = new WebSocketServer({ server }) as WsContextServer;
    this.wss.context = appContext;

    this.connectionHandler = new ConnectionHandler(appContext);
    this.messageHandler = new MessageHandler(appContext);

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.wss.on("connection", async (wsc: IdentifyableWebSocket, req) => {
      await this.connectionHandler.handleConnection(this.wss, wsc, req);

      wsc.on("message", async (data) => {
        await this.messageHandler.handleMessage(wsc, data);
      });

      wsc.on("close", async () => {
        await this.connectionHandler.handleClose(wsc);
      });
    });
  }
}
