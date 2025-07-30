import { HandState } from "./HandState";
import { Player } from "./Player";

export class GameState {
  id: number;
  table: any;
  players: Array<Player>;
  currentHand: HandState | null;
  open: boolean;
  inPlay: boolean;

  constructor(id: number, table: any) {
    this.id = id;
    this.table = table;
    this.players = []; // Active players at the table
    this.currentHand = null;
    this.open = true; // Whether the game is playable
    this.inPlay = false; // Whether the game is currently serving hands
  }
}
