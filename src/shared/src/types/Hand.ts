import { Moment } from "moment";

export type Hand = {
  id: number;
  gameId: number;
  createdAt: Moment;
  lastUpdatedAt: Moment;
  isCompleted: boolean;
};
