import { GameType } from "../enums";
import { Moment } from "moment";

export type Table = {
  id: number;
  name: string;
  sbSize: number;
  bbSize: number;
  minBuyIn: number;
  maxBuyIn: number;
  gameType: GameType;
  createdAt: Moment;
};
