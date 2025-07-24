import { IncomingMessage } from "http";
import { IdentifyableWebSocket } from "../IdentifyableWebSocket";
import { WsContextServer } from "../server";
import { ServerAction } from "../../models/ServerAction";
import { ServerEvent } from "@donk/utils";
import { createUuid } from "../../utils/helpers";
import { AppContext } from "../../context";

export class ConnectionHandler {
  constructor(private appContext: AppContext) {}

  private addIdentityToClient(wsc: IdentifyableWebSocket, gameId: number) {
    wsc.id = createUuid();
    wsc.name = wsc.id;
    wsc.gameId = gameId;
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
    const handleMessage = async (message: string) => {
      // Only the most recent callback is used against a channel (game-event:<id>)
      // Therefore, ensure ALL clients associated to the game are included
      const clientsInGame = [...wss.clients].filter(
        (client) => (client as IdentifyableWebSocket).gameId === gameId,
      );

      const action: ServerAction = JSON.parse(message);
      action.nextState = await this.appContext.services.gameStateService.getGameState(gameId);

      clientsInGame.forEach((client) => {
        client.send(JSON.stringify(action));
      });
      console.log("Message received by %o: %o", wsc.name, message);
    };

    await this.appContext.sub.subscribe(`game-events:${gameId}`, handleMessage);

    // Initialize WebSocket client properties
    this.addIdentityToClient(wsc, gameId);

    const player = await services.gameStateService.addPlayer(gameId, wsc);

    if (!player) {
      console.log("Unable to create player from incoming connection. Closing");
      wsc.close();
      return;
    }

    const gameState = await services.gameStateService.getGameState(gameId);

    // Send initial events
    const userJoined: ServerAction = {
      type: ServerEvent.UserJoined,
      update: { name: wsc.name },
    };

    const tableDetails: ServerAction = {
      type: ServerEvent.GameState,
      update: { table: gameState.table },
    };

    const userDetails: ServerAction = {
      type: ServerEvent.UserInfo,
      update: { state: player },
    };

    await services.eventRelayService.publishGameEvent(gameId, userJoined);
    await services.eventRelayService.publishGameEvent(gameId, tableDetails);
    await services.eventRelayService.publishGameEvent(gameId, userDetails);

    console.log("New client connection attempt succeeded");
    console.log("# of clients connected: ", wss.clients.size);
  }

  async handleClose(wsc: IdentifyableWebSocket): Promise<void> {
    console.log(`Websocket connection closed for ${wsc.name}`);
    await this.appContext.services.gameStateService.removePlayer(wsc.gameId, wsc);

    const playerLeft: ServerAction = {
      type: ServerEvent.UserLeft,
      update: { name: wsc.name },
    };

    await this.appContext.services.eventRelayService.publishGameEvent(wsc.gameId, playerLeft);
  }
}
