import express from "express";
import WebSocket, { WebSocketServer } from "ws";

import ServerAction from "./models/ServerAction";
import UserAction from "./models/UserAction";
import TableInit from "./models/Table";
import { ServerEvent, UserEvent } from "@donk/utils";
import { User } from "./models/User";
import { IdentifyableWebSocket } from "./models/IdentifyableWebSocket";
import { createUuid } from "./utils/helpers";

const database: any = {
  GAME: [],
  USER: [
    { id: 1, name: "Chris" } as User,
    { id: 2, name: "Matt" } as User,
    { id: 3, name: "Caiyl" } as User,
    { id: 4, name: "Tim" } as User,
    { id: 5, name: "Daniel" } as User,
    { id: 6, name: "Mike" } as User,
    { id: 7, name: "Katherine" } as User,
    { id: 8, name: "Tommy" } as User,
    { id: 9, name: "Valerie" } as User,
    { id: 10, name: "Valerie" } as User,
  ],
  TABLE: [new TableInit()],
};

const app = express();
const wss = new WebSocketServer({ port: 3032 });

const table = new TableInit();

// TODO: Include validation for each of the actions.
const handleAndValidateAction = (userAction: UserAction, wsc: any) => {
  const player = table.getPlayer(wsc.id);
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
      { players: table.players },
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
      { players: table.players },
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
      { players: table.players },
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
      "RENAME",
      { prevName, nextName: player.name },
      { players: table.players },
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
      { players: table.players },
    );
    wss.clients.forEach((client) => {
      client.send(JSON.stringify(tableDetails));
    });
    // If 3+ players, and all the players sitting are ready start the game!
    if (table.isAllReady()) {
      table.startGame();
    }
  } else {
    console.log("Unexpected event");
  }
};

// Client connects to the Table
wss.on("connection", (wsc: IdentifyableWebSocket) => {
  console.log("Attempting new client connection");
  // Create ID and add player to table and associated WebSocket client
  wsc.id = createUuid();
  const clientAsPlayer = table.addPlayer(wsc);

  // TODO: Figure out an authentication workflow for

  // If the player couldn't be created, end
  if (!clientAsPlayer) {
    console.log("Rejecting connection attempt. Closing");
    wsc.close();
    return;
  }

  // Set player info on the client connection
  wsc.id = clientAsPlayer.id;
  wsc.name = clientAsPlayer.name;

  // Handle the logic for receiving new messages from clients
  wsc.on("message", (data) => {
    const userAction = new UserAction(wsc.name, data);
    console.log("User ID - %s - triggering %s", wsc.id, userAction);
    // All these actions will require updating backend state (client object, server state, etc.)
    handleAndValidateAction(userAction, wsc);
  });

  // Handle the logic for connections to the client being closed
  wsc.on("close", () => {
    console.log("Client closed");
    table.removePlayer(wsc);
    const playerLeft = new ServerAction(
      "USER_LEFT",
      { name: wsc.name },
      { players: table.players },
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
        "USER_JOINED",
        { name: wsc.name },
        { players: table.players },
      );
      client.send(JSON.stringify(userJoined));
    }
  });

  const { players: _, ...tableNoPlayers } = table;
  const tableDetails = new ServerAction(
    "TABLE_STATE",
    { table: tableNoPlayers },
    { players: table.players },
  );
  const userDetails = new ServerAction(
    "USER_INFO",
    { state: clientAsPlayer },
    { players: table.players },
  );
  wsc.send(JSON.stringify(tableDetails));
  wsc.send(JSON.stringify(userDetails));
  console.log("New client connection attempt succeeded");
  console.log("Client Count:", wss.clients.size);
});

// app.use(cors());

// app.listen(port, () => {
//   console.log(`Donkhouse 0.1 listening on port ${port}`)
// });
