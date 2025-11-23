import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "",
  database: "terminal_buses",
  synchronize: true,
  logging: false,
  entities: ["src/modules/**/*.entity.ts"],
  migrations: ["src/migrations/**/*.ts"],
});
