import { asTable, TableRepo } from "@donk/database";

export class TableService {
  private tableRepo: TableRepo;

  constructor() {
    this.tableRepo = new TableRepo();
  }

  async getTableById(id: number) {
    const tableEntity = await this.tableRepo.getTableById(id);
    return asTable(tableEntity);
  }

  async getTables() {
    return await this.tableRepo.getTables();
  }
}
