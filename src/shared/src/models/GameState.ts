import { Position } from "../enums";
import { Game } from "../types/Game";
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
  playerActOrder: Array<number>;

  constructor(
    id: number,
    table: any,
    players?: any,
    currentHand?: HandState,
    open?: boolean,
    inPlay?: boolean,
    playerActOrder?: Array<number>,
  ) {
    this.id = id;
    this.table = table;
    this.players = players || []; // Active players at the table
    this.currentHand = currentHand || null;
    this.open = open || true; // Whether the game is playable
    this.inPlay = inPlay || false; // Whether the game is currently serving hands
    this.playerActOrder = playerActOrder || [];
  }

  static fromString(str: string): GameState {
    const obj = JSON.parse(str);
    return new GameState(
      obj.id,
      obj.table,
      obj.players?.map((p: any) => Object.assign(new Player(p.id, p.name), p)),
      obj.currentHand
        ? new HandState(
            obj.currentHand.id,
            obj.currentHand.deck,
            obj.currentHand.board,
            obj.currentHand.pots,
          )
        : undefined,
      obj.open,
      obj.inPlay,
      obj.playerActOrder,
    );
  }

  static fromGameAndTable(game: Game, table: Table) {
    return new GameState(game.id, table);
  }

  // TODO: Find a way to make this conditional for game types
  dealCards() {
    const activePlayers = this.players.filter((p) => p.isInHand);
    activePlayers.forEach((p) => {
      const cardOne = this.currentHand!.deal();
      const cardTwo = this.currentHand!.deal();
      if (cardOne && cardTwo) {
        p.cards.push(cardOne, cardTwo);
      }
    });
  }

  createMainPot() {
    if (!this.currentHand) throw new Error("Hand not available");
    const activePlayerIds = this.players.filter((p) => p.isInHand).map((p) => p.id);
    this.currentHand?.pots.push({ amount: 0, eligiblePlayerIds: activePlayerIds });
    return this.currentHand?.pots[0];
  }

  setActionOrder(isPreFlop: boolean) {
    const first = isPreFlop
      ? this.players.find((p) => p.position === Position.BTN)
      : this.players.find((p) => p.position === Position.SB);
  }
}
