import moment from "moment";
import { Moment } from "moment";

export type TableEntity = {
  id: number;
  name: string;
  sb_size: number;
  bb_size: number;
  min_buy_in: number;
  max_buy_in: number;
  game_type: string;
  created_at: string;
};

export type Table = {
  id: number;
  name: string;
  sbSize: number;
  bbSize: number;
  minBuyIn: number;
  maxBuyIn: number;
  gameType: any;
  createdAt: Moment;
};

export const asTable = (entity: TableEntity): Table => {
  const { id, name, sb_size, bb_size, min_buy_in, max_buy_in, game_type, created_at } = entity;
  return {
    id,
    name,
    sbSize: sb_size,
    bbSize: bb_size,
    minBuyIn: min_buy_in,
    maxBuyIn: max_buy_in,
    gameType: game_type,
    createdAt: moment(created_at),
  };
};
