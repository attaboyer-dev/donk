import { Player } from "./Player";


export type Game = {
  inPlay: false,            // Whether the table is active (hands playing)
  pot: Number,              // Active amount in the pot
  board: string[],          // Cards on the board
  players: Player[],        // What players are currently sitting at the table
  gameMods: string[],       // What mods (72 rule) are in effect
  numPlayersSiting: number, // How many players are sitting
}
