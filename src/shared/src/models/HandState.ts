import { Player } from "./Player";
import { Pot } from "./Pot";

export class HandState {
  id: number;
  deck: Array<string>;
  players: Array<Player>;
  board: Array<string>;
  pots: Array<Pot>;
  createdAt: string;
  lastUpdatedAt: string;
  isCompleted: boolean;

  constructor(handEntity: any) {
    this.id = handEntity.id;
    this.deck = [];
    this.players = [];
    this.board = [];
    this.pots = [];
    this.createdAt = handEntity.created_at;
    this.lastUpdatedAt = handEntity.last_updated_at;
    this.isCompleted = handEntity.is_completed;
  }
}
