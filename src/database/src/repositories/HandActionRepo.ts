import PgPool from "../client";
import { HandActionEntity } from "../entities/HandActionEntity";

export class HandActionRepo {
  async getHandActions() {
    const result = await PgPool.query("SELECT * FROM hand_actions", []);
    return result.rows;
  }

  async getHandActionsByHandId(handId: number): Promise<HandActionEntity[]> {
    const result = await PgPool.query(
      "SELECT * FROM hand_actions WHERE hand_id = $1 ORDER BY created_at ASC",
      [handId],
    );
    return result.rows;
  }

  async addHandAction(action: {
    handId: number;
    actionType: string;
    value: any;
  }) {
    const result = await PgPool.query(
      "INSERT INTO hand_actions (hand_id, action_type, value) VALUES ($1, $2, $3) RETURNING *",
      [action.handId, action.actionType, action.value],
    );
    return result.rows[0];
  }

  async getHandActionById(id: number): Promise<HandActionEntity | null> {
    const result = await PgPool.query(
      "SELECT * FROM hand_actions WHERE id = $1",
      [id],
    );
    return result.rows[0] || null;
  }
}
