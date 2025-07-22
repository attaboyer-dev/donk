import express from "express";
import WebSocket, { WebSocketServer } from "ws";

import ServerAction from "./models/ServerAction";
import UserAction from "./models/UserAction";
import { ServerEvent, UserEvent } from "@donk/utils";
import { IdentifyableWebSocket } from "./ws/IdentifyableWebSocket";
import { createUuid } from "./utils/helpers";
import { initServices } from "./services/bundle";
import { createClient } from "redis";
import { WsContextServer } from "./ws/server";

const createAppContext = async () => {
  const redisClient = createClient();
  redisClient.on("error", (err) => console.error("Redis Client Error", err));
  await redisClient.connect();

  return {
    services: initServices(),
    redis: redisClient,
  };
};

(async () => {
  const appCtx = await createAppContext();
  // Get default table - start a game off it
  const tableId = 1;
  const game = await appCtx.services.gameService.startGameDev(tableId);

  appCtx.redis.set(`game:${game.id}`, JSON.stringify(game));
  express();

  const wss = new WebSocketServer({ port: 3032 }) as WsContextServer;
  wss.context = appCtx;

  // TODO: Include validation for each of the actions.
  const handleAndValidateAction = (
    userAction: UserAction,
    wsc: IdentifyableWebSocket,
  ) => {
    const player = game.getPlayer(wsc.id);
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
      if (game.isAllReady()) {
        game.start();
      }
    } else {
      console.log("Unexpected event");
    }
  };

  // Client connects to the Table
  wss.on("connection", (wsc: IdentifyableWebSocket, req) => {
    console.log("req", req.url);
    appCtx.services.gameService
      .getGameById(1)
      .then((res) => console.log("game", res));
    console.log("Processing new client connection");
    wsc.id = createUuid();
    wsc.name = wsc.id;
    const clientAsPlayer = game.addPlayer(wsc);

    // If the player couldn't be created, end
    if (!clientAsPlayer) {
      console.log("Unable to create player from incoming connection. Closing");
      wsc.close();
      return;
    }

    appCtx.redis.set("game:1", JSON.stringify(game));

    // Handle the logic for receiving new messages from clients
    wsc.on("message", (data) => {
      const userAction = new UserAction(wsc.name, data);
      console.log("User ID - %s - triggering %s", wsc.name, userAction);
      // All these actions will require updating backend state (client object, server state, etc.)
      handleAndValidateAction(userAction, wsc);
    });

    // Handle the logic for connections to the client being closed
    wsc.on("close", () => {
      console.log("Client closed");
      game.removePlayer(wsc);
      const playerLeft = new ServerAction(
        ServerEvent.UserLeft,
        { name: wsc.name },
        { players: game.players },
      );
      wss.clients.forEach((client) => {
        client.send(JSON.stringify(playerLeft));
      });
      // Ideally, we want to set a timeout and handle reconnection attempts as well, checking the client id.
      // For now, we immediately pop them off the table
    });

    // Notify each client that a new user has joined
    wss.clients.forEach((_client) => {
      const client = _client as IdentifyableWebSocket;
      if (client.readyState === WebSocket.OPEN && wsc.id !== wsc.id) {
        const userJoined = new ServerAction(
          ServerEvent.UserJoined,
          { name: wsc.name },
          { players: game.players },
        );
        client.send(JSON.stringify(userJoined));
      }
    });

    const { table, players } = game;
    const tableDetails = new ServerAction(
      ServerEvent.TableState,
      { table },
      { players },
    );
    const userDetails = new ServerAction(
      ServerEvent.UserInfo,
      { state: clientAsPlayer },
      { players: game.players },
    );
    wsc.send(JSON.stringify(tableDetails));
    wsc.send(JSON.stringify(userDetails));
    console.log("New client connection attempt succeeded");
    console.log("Client Count:", wss.clients.size);
  });
})();
