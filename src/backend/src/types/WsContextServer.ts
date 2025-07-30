import { WebSocketServer } from "ws";
import { AppContext } from "@donk/backend-core";

export interface WsContextServer extends WebSocketServer {
  context: AppContext;
}
