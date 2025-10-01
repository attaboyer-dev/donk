import { Position } from "../enums";
import { IdentifyableWebSocket } from "../types/IdentifyableWebSocket";

export class Player {
  id: any;
  name: any;
  isReady: boolean;
  isInHand: boolean; // what is this if the player has folded?
  nextToAct: boolean;
  assignedSeat: number;
  stack: any;
  cards: Array<string>;
  position: Position | null;

  constructor(id: any, name: string) {
    this.id = id;
    this.name = name;
    this.isReady = false; // Indicates whether the player is actively ready
    this.isInHand = false; // Indicates whether the player is in the hand
    this.nextToAct = false; // Indicates whether the player is next to act
    this.assignedSeat = -1; // What seat is the player sitting at the table
    this.stack = 0; // How much money the player has assigned to them in cents
    this.cards = []; // What cards the player has assigned to them
    this.position = null;
  }

  static fromIws(wsc: IdentifyableWebSocket) {
    return new Player(wsc.id, wsc.name);
  }

  isEligibleForHand() {
    return this.assignedSeat > 0 && this.stack > 0;
  }

  check() {}
}
