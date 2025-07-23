import express from "express";
import WebSocket, { WebSocketServer } from "ws";

import ServerAction from "./models/ServerAction";
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
  redisClient.on("error", (err) => console.error("Redis Client Error", err));
  await redisClient.connect();

  return {
    services: initServices(redisClient),
    redis: redisClient,
  };
};

// TODO: Include validation for each of the actions.
const handleAndValidateAction = (
  userAction: UserAction,
  wss: WsContextServer,
  wsc: IdentifyableWebSocket,
  game: GameState,
) => {
  const pIndex = game.players.findIndex((player) => player.id === wsc.id);
  const player = game.players[pIndex];
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
    // TODO: Validate player can sit, THEN
    player.isSitting = true;
    player.assignedSeat = userAction.value;
    const tableDetails = new ServerAction(
      ServerEvent.PlayerSat,
      { location: player.assignedSeat, name: player.name },
      { players: game.players },
    );
    wss.clients.forEach((client) => {
      client.send(JSON.stringify(tableDetails));
    });
  } else if (userAction.type === UserEvent.Stand) {
    // TODO: Validate player can STAND, THEN
    player.isSitting = false;
    player.assignedSeat = -1;
    const tableDetails = new ServerAction(
      ServerEvent.PlayerStood,
      { location: userAction.value, name: player.name },
      { players: game.players },
    );
    wss.clients.forEach((client) => {
      client.send(JSON.stringify(tableDetails));
    });
  } else if (userAction.type === UserEvent.BuyIn) {
    //TODO: Valdiation
    player.stack += parseFloat(userAction.value);
    const tableDetails = new ServerAction(
      ServerEvent.PlayerBuyin,
      { name: player.name, amount: userAction.value },
      { players: game.players },
    );
    wss.clients.forEach((client) => {
      client.send(JSON.stringify(tableDetails));
    });
  } else if (userAction.type === UserEvent.Leave) {
    // TODO: Participation action
  } else if (userAction.type === UserEvent.Join) {
    // TODO: Participation action
  } else if (userAction.type === UserEvent.Rename) {
    // TODO: Must be unique
    // TODO: Participation action
    const prevName = player.name;
    player.name = userAction.value;
    const tableDetails = new ServerAction(
      ServerEvent.Rename,
      { prevName, nextName: player.name },
      { players: game.players },
    );
    wss.clients.forEach((client) => {
      client.send(JSON.stringify(tableDetails));
    });
  } else if (userAction.type === UserEvent.Ready) {
    // TODO: Validation on whether a player can be ready
    player.isReady = true;
    const tableDetails = new ServerAction(
      ServerEvent.Ready,
      { name: player.name },
      { players: game.players },
    );
    wss.clients.forEach((client) => {
      client.send(JSON.stringify(tableDetails));
    });
    // If 3+ players, and all the players sitting are ready start the game!
    // TODO!!
  } else {
    console.log("Unexpected event");
  }
};

(async () => {
  // Create the application context - a singleton available across APIs/WS calls
  const appCtx = await createAppContext();

  // For local testing - start a game
  await appCtx.services.gameStateService.startGame(1);

  const wss = new WebSocketServer({ port: 3032 }) as WsContextServer;
  wss.context = appCtx;

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

    // Enhance clients with a unique ID and name
    // TODO: This should be derived from 'user' attributes, passed in via cookie
    // Or another more secure manner
    wsc.id = createUuid();
    wsc.name = wsc.id;
    const player = appCtx.services.gameStateService.addPlayer(gameId, wsc);

    // If the player couldn't be created, close the connection and log
    if (!player) {
      console.log("Unable to create player from incoming connection. Closing");
      wsc.close();
      return;
    }

    const gameState =
      await appCtx.services.gameStateService.getGameState(gameId);

    // Notify each client that a new user has joined
    wss.clients.forEach((_client) => {
      const client = _client as IdentifyableWebSocket;
      if (client.readyState === WebSocket.OPEN && wsc.id !== wsc.id) {
        const userJoined = new ServerAction(
          ServerEvent.UserJoined,
          { name: wsc.name },
          { players: gameState.players },
        );
        client.send(JSON.stringify(userJoined));
      }
    });

    // Indicate the table state has changed
    const { table, players } = gameState;
    const tableDetails = new ServerAction(
      ServerEvent.TableState,
      { table },
      { players },
    );

    // Indicate the user details have changed
    const userDetails = new ServerAction(
      ServerEvent.UserInfo,
      { state: player },
      { players: gameState.players },
    );
    wsc.send(JSON.stringify(tableDetails));
    wsc.send(JSON.stringify(userDetails));
    console.log("New client connection attempt succeeded");
    console.log("Client Count:", wss.clients.size);

    // Handle the logic for receiving new messages from clients
    wsc.on("message", async (data) => {
      const userAction = new UserAction(wsc.name, data);
      console.log("User ID - %s - triggering %s", wsc.name, userAction);
      // All these actions will require updating backend state (client object, server state, etc.)
      const currentGameState =
        await appCtx.services.gameStateService.getGameState(gameId);
      handleAndValidateAction(userAction, wss, wsc, currentGameState);
    });

    // Handle the logic for connections to the client being closed
    wsc.on("close", async () => {
      console.log(`Websocket connection closed for ${wsc.name}`);
      const gameState = await appCtx.services.gameStateService.removePlayer(
        gameId,
        wsc,
      );
      const playerLeft = new ServerAction(
        ServerEvent.UserLeft,
        { name: wsc.name },
        { players: gameState.players },
      );
      wss.clients.forEach((client) => {
        client.send(JSON.stringify(playerLeft));
      });
      // Ideally, we want to set a timeout and handle reconnection attempts as well, checking the client id.
      // For now, we immediately pop them off the table
    });
  });
})();
