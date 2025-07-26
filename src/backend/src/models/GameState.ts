import Player from "./Player";
import { Table } from "src/shared/src";

export default class GameState {
  id: number;
  table: Table;
  players: Array<Player>;
  open: boolean;
  active: boolean;

  constructor(id: number, table: Table) {
    this.id = id;
    this.table = table;
    this.players = []; // Active players at the table
    this.open = true; // Whether the game is playable
    this.active = false; // Whether the game is currently serving hands
  }
}
