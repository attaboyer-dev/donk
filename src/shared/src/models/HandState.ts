import { Hand } from "../types/Hand";
import { Pot } from "../types/Pot";

export class HandState {
  id: number;
  deck: Array<string>;
  board: Array<string>;
  pots: Array<Pot>;

  constructor(id: number, deck?: Array<string>, board?: Array<string>, pots?: Array<Pot>) {
    this.id = id;
    this.deck = deck || [];
    this.board = board || [];
    this.pots = pots || [];
  }

  static fromHand(hand: Hand): HandState {
    return new HandState(hand.id);
  }

  static fromString(str: string) {
    const obj = JSON.parse(str);
    if (!obj) return null;
    return new HandState(obj.id, obj.deck, obj.board, obj.pots);
  }

  shuffle() {
    this.deck = this.deck.sort(() => Math.random() - 0.5);
  }

  burn() {
    const card = this.deck.pop();
    if (!card) throw new Error("Unable to burn a card");
  }

  deal(): string {
    const card = this.deck.pop();
    if (!card) throw new Error("Unable to deal a card");
    return card;
  }
}
