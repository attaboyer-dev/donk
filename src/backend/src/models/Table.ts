import { IdentifyableWebSocket } from "./IdentifyableWebSocket.js";
import Player from "./Player.js";
import { GameType } from "@donk/utils";

export default class Table {
  id: number;
  name: string;
  sbSize: number;
  bbSize: number;
  minBuyIn: number;
  maxBuyIn: number;
  gameType: GameType;
  players: Array<any>;

  constructor() {
    this.id = 1; // Unique ID of the table
    this.name = "The Table"; // Name of the table
    this.sbSize = 0.1; // Small blind of the table
    this.bbSize = 0.2; // Big blind of the table
    this.minBuyIn = 2; // Minimum buy-in amount allowed
    this.maxBuyIn = 20; // Maximum buy-in amount allowed
    this.gameType = GameType.NLHE; // Game Type of the table
    this.players = []; // Active players at the table

    // this.owner_player_id = -1; // Unique Player ID of the Table Owner
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
    let toReturn = true;
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
  startGame = () => {
    return false;
  };
}
