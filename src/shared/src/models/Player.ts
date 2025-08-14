import { IdentifyableWebSocket } from "../types/IdentifyableWebSocket";

export class Player {
  id: any;
  name: any;
  isReady: boolean;
  isBtn: boolean;
  assignedSeat: number;
  stack: any;
  cards: Array<string>;
  constructor(wsc: IdentifyableWebSocket) {
    this.id = wsc.id;
    this.name = wsc.name;
    this.isBtn = false; // Whether the player has the button
    this.isReady = false; // Indicates whether the player is actively ready
    this.assignedSeat = -1; // What seat is the player sitting at the table
    this.stack = 0.0; // How much money the player has assigned to them
    this.cards = []; // What cards the player has assigned to them
  }

  isEligibleForHand = () => this.assignedSeat > 0 && this.stack > 0;
}
