import { WebSocketServer } from "ws";
import { AppContext } from "../context";

export const wsContextServer = (wss: WebSocketServer, appCtx: AppContext) => {};

export interface WsContextServer extends WebSocketServer {
  context: AppContext;
}

/**
 * Create
 */
