import WebSocket, { WebSocketServer } from "ws";
import { ServerAction } from "./models/ServerAction";
import UserAction from "./models/UserAction";
import { ServerEvent, UserEvent } from "@donk/utils";
import { IdentifyableWebSocket } from "./ws/IdentifyableWebSocket";
import { createUuid } from "./utils/helpers";
import { initServices } from "./services/bundle";
import { createClient, RedisClientType } from "redis";
import { WsContextServer } from "./ws/server";
import GameState from "./models/GameState";

const createAppContext = async () => {
  const redisClient: RedisClientType = createClient();
  const sub: RedisClientType = createClient();
  const pub: RedisClientType = createClient();
  redisClient.on("error", (err) => console.error("Redis Client Error", err));

  try {
    await Promise.all([redisClient.connect(), sub.connect(), pub.connect()]);
  } catch (err) {
    console.log("Error while trying to connect to redis");
  }

  return {
    services: initServices(redisClient),
    redis: redisClient,
    pub,
    sub,
  };
};

(async () => {
  // Create the application context - a singleton available across APIs/WS calls
  const appCtx = await createAppContext();

  // For local testing - start a game
  await appCtx.services.gameStateService.startGame(1);

  const wss = new WebSocketServer({ port: 3032 }) as WsContextServer;
  wss.context = appCtx;

  // TODO: Include validation for each of the actions.
  // TODO: This should be a event-handler, or something of the like
  const handleAndValidateAction = async (
    userAction: UserAction,
    wsc: IdentifyableWebSocket,
    game: GameState,
  ) => {
    if (userAction.type === UserEvent.Fold) {
      // TODO: Gameplay action
    } else if (userAction.type === UserEvent.Check) {
      // TODO: Gameplay action
    } else if (userAction.type === UserEvent.Call) {
      // TODO: Gameplay action
    } else if (userAction.type === UserEvent.Raise) {
      // TODO: Gameplay action
    } else if (userAction.type === UserEvent.Show) {
      // TODO: Gameplay action
    } else if (userAction.type === UserEvent.Sit) {
      // Update game state
      await appCtx.services.gameStateService.playerSits(
        game.id,
        wsc.id,
        userAction.value,
      );

      // Create notification message
      const tableDetails: ServerAction = {
        type: ServerEvent.PlayerSat,
        update: { location: userAction.value, name: wsc.name },
      };

      // Publish message to the game-events channel
      await appCtx.pub.publish(
        `game-events:${game.id}`,
        JSON.stringify(tableDetails),
      );
    } else if (userAction.type === UserEvent.Stand) {
      // TODO: Validate player can STAND, THEN
      await appCtx.services.gameStateService.playerStands(game.id, wsc.id);

      const tableDetails: ServerAction = {
        type: ServerEvent.PlayerStood,
        update: { location: userAction.value, name: wsc.name },
      };

      // Publish message to the game-events channel
      await appCtx.pub.publish(
        `game-events:${game.id}`,
        JSON.stringify(tableDetails),
      );
    } else if (userAction.type === UserEvent.BuyIn) {
      //TODO: Valdiation
      const buyIn = parseFloat(userAction.value);
      await appCtx.services.gameStateService.playerBuysIn(
        game.id,
        wsc.id,
        buyIn,
      );

      const tableDetails: ServerAction = {
        type: ServerEvent.PlayerBuyin,
        update: { name: wsc.name, amount: userAction.value },
      };

      // Publish message to the game-events channel
      await appCtx.pub.publish(
        `game-events:${game.id}`,
        JSON.stringify(tableDetails),
      );
    } else if (userAction.type === UserEvent.Leave) {
      // TODO: Participation action
    } else if (userAction.type === UserEvent.Join) {
      // TODO: Participation action
    } else if (userAction.type === UserEvent.Rename) {
      // TODO: Must be unique
      // TODO: Participation action
      const prevName = wsc.name;
      await appCtx.services.gameStateService.playerRenames(
        game.id,
        wsc.id,
        userAction.value,
      );
      wsc.name = userAction.value;
      const tableDetails: ServerAction = {
        type: ServerEvent.Rename,
        update: { prevName, nextName: userAction.value },
      };
      // Publish message to the game-events channel
      await appCtx.pub.publish(
        `game-events:${game.id}`,
        JSON.stringify(tableDetails),
      );
    } else if (userAction.type === UserEvent.Ready) {
      // TODO: Validation on whether a player can be ready
      await appCtx.services.gameStateService.playerReady(game.id, wsc.id);
      const tableDetails: ServerAction = {
        type: ServerEvent.Ready,
        update: { name: wsc.name },
      };
      // Publish message to the game-events channel
      await appCtx.pub.publish(
        `game-events:${game.id}`,
        JSON.stringify(tableDetails),
      );
      // If 3+ players, and all the players sitting are ready start the game!
      // TODO!!
    } else {
      console.log("Unexpected event");
    }
  };

  // Client attempts connection to a game
  wss.on("connection", async (wsc: IdentifyableWebSocket, req) => {
    console.log("Processing new websocket connection");

    const url = new URL(req.url || "", "http://localhost");
    const gameId = Number(url.searchParams.get("gameId"));
    if (!gameId) {
      console.warn(
        "No game id was received as part of the connection attempt, closing",
      );
      wsc.close();
      return;
    }

    // Trigger awareness to the client
    const handleMessage = async (message: string) => {
      const clientsInGame = [...wss.clients].filter(
        (client) => (client as IdentifyableWebSocket).gameId === gameId,
      );

      const action: ServerAction = JSON.parse(message);
      action.nextState =
        await appCtx.services.gameStateService.getGameState(gameId);

      clientsInGame.forEach((client) => {
        client.send(JSON.stringify(action));
      });
      console.log("Message received by %o: %o", wsc.name, message);
    };

    // Subscribe to game-events
    await appCtx.sub.subscribe(`game-events:${gameId}`, handleMessage);

    // Enhance clients with a unique ID and name
    // TODO: This should be derived from 'user' attributes, passed in via cookie
    // Or another more secure manner
    wsc.id = createUuid();
    wsc.name = wsc.id;
    wsc.gameId = gameId;
    const player = await appCtx.services.gameStateService.addPlayer(
      gameId,
      wsc,
    );

    // If the player couldn't be created, close the connection and log
    if (!player) {
      console.log("Unable to create player from incoming connection. Closing");
      wsc.close();
      return;
    }

    const gameState =
      await appCtx.services.gameStateService.getGameState(gameId);

    const userJoined: ServerAction = {
      type: ServerEvent.UserJoined,
      update: { name: wsc.name },
    };

    // Publish message to the game-events channel
    await appCtx.pub.publish(
      `game-events:${gameId}`,
      JSON.stringify(userJoined),
    );

    // Indicate the table state has changed
    const tableDetails: ServerAction = {
      type: ServerEvent.GameState,
      update: { table: gameState.table },
    };

    // Indicate the user details have changed
    const userDetails: ServerAction = {
      type: ServerEvent.UserInfo,
      update: { state: player },
    };

    await appCtx.pub.publish(
      `game-events:${gameId}`,
      JSON.stringify(tableDetails),
    );
    await appCtx.pub.publish(
      `game-events:${gameId}`,
      JSON.stringify(userDetails),
    );

    console.log("New client connection attempt succeeded");
    console.log("Client Count:", wss.clients.size);

    // Handle the logic for receiving new messages from clients
    wsc.on("message", async (data) => {
      const userAction = new UserAction(wsc.name, data);
      console.log("User ID - %s - triggering %s", wsc.name, userAction);
      // All these actions will require updating backend state (client object, server state, etc.)
      const currentGameState =
        await appCtx.services.gameStateService.getGameState(gameId);
      handleAndValidateAction(userAction, wsc, currentGameState);
    });

    // Handle the logic for connections to the client being closed
    // TODO: Update this to potentially unsubscribe, in case there are no connections left
    wsc.on("close", async () => {
      console.log(`Websocket connection closed for ${wsc.name}`);
      await appCtx.services.gameStateService.removePlayer(gameId, wsc);

      const playerLeft: ServerAction = {
        type: ServerEvent.UserLeft,
        update: { name: wsc.name },
      };

      await appCtx.pub.publish(
        `game-events:${gameId}`,
        JSON.stringify(playerLeft),
      );

      // Ideally, we want to set a timeout and handle reconnection attempts as well, checking the client id.
      // For now, we immediately pop them off the table
    });
  });
})();
