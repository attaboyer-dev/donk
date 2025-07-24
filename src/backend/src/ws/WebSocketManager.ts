import { WebSocketServer } from "ws";
import { IdentifyableWebSocket } from "./IdentifyableWebSocket";
import { WsContextServer } from "./server";
import { AppContext } from "../context";
import { ConnectionHandler } from "./handlers/ConnectionHandler";
import { MessageHandler } from "./handlers/MessageHandler";

export class WebSocketManager {
  private wss: WsContextServer;
  private connectionHandler: ConnectionHandler;
  private messageHandler: MessageHandler;

  constructor(
    private appContext: AppContext,
    port: number = 3032,
  ) {
    this.wss = new WebSocketServer({ port }) as WsContextServer;
    this.wss.context = appContext;

    this.connectionHandler = new ConnectionHandler(appContext);
    this.messageHandler = new MessageHandler(appContext);

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.wss.on("connection", async (wsc: IdentifyableWebSocket, req) => {
      await this.connectionHandler.handleConnection(wsc, req, this.wss);

      wsc.on("message", async (data) => {
        await this.messageHandler.handleMessage(wsc, data);
      });

      wsc.on("close", async () => {
        await this.connectionHandler.handleClose(wsc);
      });
    });
  }
}
