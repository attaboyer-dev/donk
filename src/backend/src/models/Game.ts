import { IdentifyableWebSocket } from "./IdentifyableWebSocket";
import Player from "./Player";
import { GameType, Table } from "@donk/utils";

export default class Game {
  table: Table;
  gameType: GameType;
  players: Array<Player>;

  constructor(table: Table) {
    this.table = table;            // Table specific details
    this.gameType = GameType.NLHE; // Game Type of the table
    this.players = [];             // Active players at the table
  }

  /*
    Adding player to the table
  */
  addPlayer = (wsc: IdentifyableWebSocket) => {
    let toReturn;
    const pIndex = this.players.findIndex((player) => player.id === wsc.id);
    if (pIndex >= 0) {
      console.log("WARNING: Player - %s - already sitting at table");
    } else if (this.players.length >= 9) {
      console.log("WARNING: Table is already at max capacity");
    } else {
      toReturn = new Player(wsc);
      this.players.push(toReturn);
      console.log("Adding new player to table: %s", wsc.id);
    }
    return toReturn;
  };

  /*
    Removing player from the table
  */
  removePlayer = (wsc: any) => {
    let succeeded = false;
    const pIndex = this.players.findIndex((player) => player.id === wsc.id);
    if (pIndex >= 0) {
      this.players.splice(pIndex, 1);
      console.log("Removed player from table: %s", wsc.id);
      succeeded = true;
    } else {
      console.log("WARNING: Unable to find player - %s - at the table", wsc.id);
    }
    return succeeded;
  };

  getPlayer = (id: number) => {
    const pIndex = this.players.findIndex((player) => player.id === id);
    return this.players[pIndex];
  };

  isAllReady = () => {
    let satAndReady = this.players.every((player) => {
      if (player.isSitting && !player.isReady) {
        return false;
      } else {
        return true;
      }
    });
    let countReady = this.players.filter((player) => player.isReady).length;
    return satAndReady && countReady > 2;
  };

  // TODO: Figure out how we're going to actually start the game
  start = () => {
    return false;
  };
}
