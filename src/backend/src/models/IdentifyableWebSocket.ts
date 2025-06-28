import WebSocket from "ws";

export interface IdentifyableWebSocket extends WebSocket {
  id: string;
  name: string;
}
