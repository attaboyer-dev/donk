import moment from "moment";
import { Table, GameType } from "@donk/shared";
import { TableEntity } from "@donk/database";

export const asTable = (entity: TableEntity): Table => {
  const { id, name, sb_size, bb_size, min_buy_in, max_buy_in, game_type, created_at } = entity;
  return {
    id,
    name,
    sbSize: sb_size,
    bbSize: bb_size,
    minBuyIn: min_buy_in,
    maxBuyIn: max_buy_in,
    gameType: game_type as GameType,
    createdAt: moment(created_at),
  };
};