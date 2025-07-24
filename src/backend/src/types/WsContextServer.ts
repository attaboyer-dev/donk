import { WebSocketServer } from "ws";
import { AppContext } from "./AppContext";

export interface WsContextServer extends WebSocketServer {
  context: AppContext;
}
