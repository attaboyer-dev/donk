import moment from "moment";
import { Game } from "@donk/shared";
import { GameEntity } from "@donk/database";

export const asGame = (entity: GameEntity): Game => {
  const { id, table_id, created_at, completed_at } = entity;
  return {
    id,
    tableId: table_id,
    createdAt: moment(created_at),
    completedAt: completed_at ? moment(completed_at) : null,
  };
};
