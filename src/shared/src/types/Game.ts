import { Moment } from "moment";

export type Game = {
  id: number;
  tableId: number;
  createdAt: Moment;
  completedAt: Moment | null;
};