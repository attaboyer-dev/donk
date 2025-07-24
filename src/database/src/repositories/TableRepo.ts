import PgPool from "../client";
import { TableEntity } from "../entities/TableEntity";

export class TableRepo {
  async getTables() {
    const result = await PgPool.query("SELECT * FROM tables", []);
    return result.rows;
  }

  async getTableById(id: number): Promise<TableEntity> {
    const result = await PgPool.query("SELECT * FROM tables WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  async addTable(table: { name: string }) {
    const result = await PgPool.query("INSERT INTO tables (name) VALUES ($1) RETURNING *", [
      table.name,
    ]);
    return result.rows[0];
  }
}
