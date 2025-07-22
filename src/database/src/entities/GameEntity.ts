import moment from "moment";
import { Moment } from "moment";

export type GameEntity = {
  id: number;
  table_id: number;
  created_at: string;
  completed_at?: string;
};

export type Game = {
  id: number;
  tableId: number;
  createdAt: Moment;
  completedAt: Moment | null;
};

export const asGame = (entity: GameEntity): Game => {
  const { id, table_id, created_at, completed_at } = entity;
  return {
    id,
    tableId: table_id,
    createdAt: moment(created_at),
    completedAt: completed_at ? moment(completed_at) : null,
  };
};
