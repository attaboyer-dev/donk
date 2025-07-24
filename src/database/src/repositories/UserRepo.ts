import PgPool from "../client";
import { UserEntity } from "../entities/UserEntity";

export class UserRepo {
  async getUsers(): Promise<UserEntity[]> {
    const result = await PgPool.query("SELECT * FROM users", []);
    return result.rows;
  }

  async getUserById(id: number): Promise<UserEntity | null> {
    const result = await PgPool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  async getUserByEmail(email: string): Promise<UserEntity | null> {
    const result = await PgPool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0] || null;
  }

  async addUser(user: { name: string; email: string }): Promise<UserEntity> {
    const result = await PgPool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [user.name, user.email],
    );
    return result.rows[0];
  }

  async updateUser(
    id: number,
    updates: Partial<{ name: string; email: string }>,
  ): Promise<UserEntity | null> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");
    const values = [id, ...Object.values(updates)];

    const result = await PgPool.query(
      `UPDATE users SET ${setClause} WHERE id = $1 RETURNING *`,
      values,
    );
    return result.rows[0] || null;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await PgPool.query("DELETE FROM users WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
