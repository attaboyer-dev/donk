import { Table } from "../types/Table";
import { HandState } from "./HandState";
import { Player } from "./Player";

export class GameState {
  id: number;
  table: Table;
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

  isButtonAssigned = () => !!this.players.find((player) => player.isBtn);

  rotateButton = () => {
    if (this.players.length < 2) return;

    const currentBtnIdx = this.players.findIndex((p) => p.isBtn);
    if (currentBtnIdx !== -1) {
      this.players[currentBtnIdx].isBtn = false;
    }

    let nextIdx = currentBtnIdx;
    let found = false;
    const n = this.players.length;
    for (let i = 1; i <= n; i++) {
      const idx = (currentBtnIdx + i) % n;
      const player = this.players[idx];
      if (player.isEligibleForHand()) {
        nextIdx = idx;
        found = true;
        break;
      }
    }

    if (found) {
      this.players[nextIdx].isBtn = true;
    }
  };

  initializeButton = () => {
    const eligiblePlayers = this.players.filter((player) => player.isEligibleForHand());
    if (eligiblePlayers.length < 2) return;

    const randomIdx = Math.floor(Math.random() * eligiblePlayers.length);
    const chosenPlayer = eligiblePlayers[randomIdx];

    chosenPlayer.isBtn = true;
  };
}
