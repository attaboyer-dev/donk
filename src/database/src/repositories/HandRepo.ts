import PgPool from "../client";
import { HandEntity } from "../entities/HandEntity";

export class HandRepo {
  async getHands() {
    const result = await PgPool.query("SELECT * FROM hands", []);
    return result.rows;
  }

  async getHandsByGameId(gameId: number): Promise<HandEntity[]> {
    const result = await PgPool.query(
      "SELECT * FROM hands WHERE game_id = $1 ORDER BY created_at ASC",
      [gameId],
    );
    return result.rows;
  }

  async getHandById(id: number): Promise<HandEntity | null> {
    const result = await PgPool.query("SELECT * FROM hands WHERE id = $1", [
      id,
    ]);
    return result.rows[0] || null;
  }

  async addHand(hand: { gameId: number }) {
    const result = await PgPool.query(
      "INSERT INTO hands (game_id) VALUES ($1) RETURNING *",
      [hand.gameId],
    );
    return result.rows[0];
  }

  async updateHand(id: number) {
    const result = await PgPool.query(
      "UPDATE hands SET last_updated_at = NOW() WHERE id = $1 RETURNING *",
      [id],
    );
    return result.rows[0];
  }

  async completeHand(id: number) {
    const result = await PgPool.query(
      "UPDATE hands SET is_completed = true, last_updated_at = NOW() WHERE id = $1 RETURNING *",
      [id],
    );
    return result.rows[0];
  }
}
