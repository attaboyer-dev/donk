import PgPool from "../client";
import { HandUsersEntity } from "../entities/HandPlayersEntity";

export class HandPlayersRepo {
  async getHandPlayers() {
    const result = await PgPool.query("SELECT * FROM hand_players", []);
    return result.rows;
  }

  async getHandPlayersByHandId(handId: number): Promise<HandUsersEntity[]> {
    const result = await PgPool.query(
      "SELECT * FROM hand_players WHERE hand_id = $1 ORDER BY seat",
      [handId],
    );
    return result.rows;
  }

  async getHandPlayersByPlayerId(playerId: number): Promise<HandUsersEntity[]> {
    const result = await PgPool.query(
      "SELECT * FROM hand_players WHERE player_id = $1",
      [playerId],
    );
    return result.rows;
  }

  async addHandPlayer(handPlayer: {
    handId: number;
    playerId: number;
    seat: string;
  }) {
    const result = await PgPool.query(
      "INSERT INTO hand_players (hand_id, player_id, seat) VALUES ($1, $2, $3) RETURNING *",
      [handPlayer.handId, handPlayer.playerId, handPlayer.seat],
    );
    return result.rows[0];
  }

  async removeHandPlayer(handId: number, playerId: number) {
    const result = await PgPool.query(
      "DELETE FROM hand_players WHERE hand_id = $1 AND player_id = $2 RETURNING *",
      [handId, playerId],
    );
    return result.rows[0];
  }
}
