import { AppDataSource } from "../../database/data-source";
import { User } from "./user.entity";

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  async findAll() {
    return await this.userRepository.find();
  }

  async findById(id: number) {
    return await this.userRepository.findOneBy({ id });
  }

  async create(userData: Partial<User>) {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  async delete(id: number) {
    return await this.userRepository.delete(id);
  }
}
