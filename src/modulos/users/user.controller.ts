import { Request, Response } from "express";
import { UserService } from "./user.service";

const userService = new UserService();

export class UserController {
  static async getUsers(req: Request, res: Response) {
    const users = await userService.findAll();
    res.json(users);
  }

  static async getUser(req: Request, res: Response) {
    const { id } = req.params;
    const user = await userService.findById(Number(id));
    res.json(user);
  }

  static async createUser(req: Request, res: Response) {
    const user = await userService.create(req.body);
    res.json(user);
  }

  static async deleteUser(req: Request, res: Response) {
    const { id } = req.params;
    await userService.delete(Number(id));
    res.json({ message: "Usuario eliminado" });
  }
}
