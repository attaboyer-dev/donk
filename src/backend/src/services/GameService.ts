import {
  asGame,
  GameEntity,
  GameRepo,
  asTable,
  TableRepo,
} from "@donk/database";
import GameState from "../models/GameState";

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
    return new GameState(game.id, table);
  }

  async startGameDev(tableId: number) {
    const table = asTable(await this.tableRepo.getTableById(tableId));
    return new GameState(1, table);
  }
}
