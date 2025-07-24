import { WebSocketServer } from "ws";
import { AppContext } from "../context";

export interface WsContextServer extends WebSocketServer {
  context: AppContext;
}
