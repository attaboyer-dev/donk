import { UserRepo } from "@donk/database";

export class UserService {
  private userRepo: UserRepo;

  constructor() {
    this.userRepo = new UserRepo();
  }

  async getUserById(id: number) {
    return this.userRepo.getUserById(id);
  }

  async createUser(userData: { name: string; email: string }) {
    return this.userRepo.addUser(userData);
  }
}
