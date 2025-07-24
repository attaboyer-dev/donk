import { IdentifyableWebSocket } from "../ws/IdentifyableWebSocket";

export default class Player {
  id: any;
  name: any;
  isReady: boolean;
  assignedSeat: number;
  stack: any;
  constructor(wsc: IdentifyableWebSocket) {
    this.id = wsc.id;
    this.name = wsc.name;
    //this.is_owner = false;       // Whether the player owns the table
    //this.is_in_hand = false;     // Whether the player is in the hand
    //this.is_mucked = false;      // Whether the player has mucked their cards
    //this.is_btn = false;         // Whether the player has the button
    this.isReady = false; // Indicates whether the player is actively ready
    this.assignedSeat = -1; // What seat is the player sitting at the table
    //this.position = "";          // Position in table in relation to order-of-play
    this.stack = 0.0; // How much money the player has assigned to them
    //this.cards = [];             // What cards the player has assigned to them
  }
}
