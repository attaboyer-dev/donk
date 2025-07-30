import { IncomingMessage } from "http";
import { IdentifyableWebSocket } from "../../types/IdentifyableWebSocket";
import { WsContextServer } from "../../types/WsContextServer";
import { ServerEvent, ServerMessage } from "@donk/shared";
import { createUuid } from "../../utils/helpers";
import { AppContext } from "../../types/AppContext";

export class ConnectionHandler {
  constructor(private appContext: AppContext) {}

  private addIdentityToClient(
    wsc: IdentifyableWebSocket,
    gameId: number,
    gameEventHandler: (message: string) => Promise<void>,
  ) {
    wsc.id = createUuid();
    wsc.name = wsc.id;
    wsc.gameId = gameId;
    wsc.gameEventHandler = gameEventHandler;
  }

  async handleConnection(
    wss: WsContextServer,
    wsc: IdentifyableWebSocket,
    req: IncomingMessage,
  ): Promise<void> {
    console.log("Processing new websocket connection");
    const { services } = this.appContext;

    const url = new URL(req.url || "", "http://localhost");
    const gameId = Number(url.searchParams.get("gameId"));

    if (!gameId) {
      console.warn("No game id was received as part of the connection attempt, closing");
      wsc.close();
      return;
    }

    // Set up Redis subscription for game events
    const handleGameEvent = async (message: string) => {
      const action: ServerMessage = JSON.parse(message);
      action.nextState = await this.appContext.services.gameStateService.getGameState(gameId);

      wsc.send(JSON.stringify(action));
      console.log("Message received by %o: %o", wsc.name, message);
    };

    await services.eventRelayService.subscribeToGameEvents(gameId, handleGameEvent);

    // Store the handler for cleanup
    wsc.gameEventHandler = handleGameEvent;

    // Initialize WebSocket client properties
    this.addIdentityToClient(wsc, gameId, handleGameEvent);

    const player = await services.gameStateService.addPlayer(gameId, wsc);

    if (!player) {
      console.error("Unable to create player from incoming connection. Closing");
      wsc.close();
      return;
    }

    // Send initial events
    const userJoined: ServerMessage = {
      type: ServerEvent.UserJoined,
      update: { name: wsc.name },
    };

    const userDetails: ServerMessage = {
      type: ServerEvent.UserInfo,
      update: { state: player },
    };

    await services.eventRelayService.publishGameEvent(gameId, userJoined);
    await services.eventRelayService.publishGameEvent(gameId, userDetails);

    console.log("New client connected successfully");
    console.log("# of clients connected: ", wss.clients.size);
  }

  async handleClose(wsc: IdentifyableWebSocket): Promise<void> {
    const { services } = this.appContext;

    // Unsubscribe from game events
    if (wsc.gameEventHandler) {
      await services.eventRelayService.unsubscribeFromGameEvents(wsc.gameId, wsc.gameEventHandler);
    }

    await services.gameStateService.removePlayer(wsc.gameId, wsc);

    const playerLeft: ServerMessage = {
      type: ServerEvent.UserLeft,
      update: { name: wsc.name },
    };

    await services.eventRelayService.publishGameEvent(wsc.gameId, playerLeft);
    console.log(`Websocket connection closed for ${wsc.name}`);
  }
}
