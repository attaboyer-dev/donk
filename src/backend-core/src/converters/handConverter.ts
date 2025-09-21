import { Hand } from "@donk/shared";
import { HandEntity } from "@donk/database";
import moment from "moment";

export const asHand = (entity: HandEntity): Hand => {
  const { id, game_id, created_at, last_updated_at, is_completed } = entity;
  return {
    id,
    gameId: game_id,
    createdAt: moment(created_at),
    lastUpdatedAt: moment(last_updated_at),
    isCompleted: is_completed,
  };
};
