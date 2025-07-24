import PgPool from "../client";
import { GameEntity } from "../entities/GameEntity";

export class GameRepo {
  async getGames() {
    const result = await PgPool.query("SELECT * FROM games", []);
    return result.rows;
  }

  async getGameById(id: number): Promise<GameEntity> {
    const result = await PgPool.query("SELECT * FROM games WHERE id = $1", [id]);
    return result.rows[0];
  }

  async addGame(tableId: number): Promise<GameEntity> {
    const result = await PgPool.query("INSERT INTO games (table_id) VALUES ($1) RETURNING *", [
      tableId,
    ]);
    return result.rows[0];
  }

  async completeGame(id: number): Promise<GameEntity> {
    const result = await PgPool.query(
      "UPDATE games SET completed_at = NOW() WHERE id = $1 RETURNING *",
      [id],
    );
    return result.rows[0];
  }
}
