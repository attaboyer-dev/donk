import { GameEntity, GameRepo, TableRepo } from "@donk/database";
import { GameState } from "@donk/shared";
import { asTable } from "../converters/tableConverter";
import { asGame } from "../converters/gameConverter";

export class GameService {
  private gameRepo: GameRepo;
  private tableRepo: TableRepo;

  constructor() {
    this.gameRepo = new GameRepo();
    this.tableRepo = new TableRepo();
  }

  async getGameById(id: number): Promise<GameEntity | null> {
    return await this.gameRepo.getGameById(id);
  }

  async startGame(tableId: number) {
    const table = asTable(await this.tableRepo.getTableById(tableId));
    const game = asGame(await this.gameRepo.addGame(tableId));
    return GameState.fromGameAndTable(game, table);
  }
}
