import PgPool from "../client";

export class TableRepo {
  async getTables() {
    const result = await PgPool.query("SELECT * FROM tables", []);
    return result.rows;
  }

  async addTable(table: { name: string }) {
    const result = await PgPool.query(
      "INSERT INTO tables (name) VALUES ($1) RETURNING *",
      [table.name],
    );
    return result.rows[0];
  }
}
