import { User } from "../../core/model";

export const USER_SERVICE = Symbol("USER_SERVICE");

export interface IUserService {
  getAllUsers(): Promise<User[]>;
  getUserDetail(id: number): Promise<User>;
  createUser(user: Omit<User, "id">): Promise<User>;
  updateUser(id: number, user: Partial<Omit<User, "id">>): Promise<User>;
  deleteUser(id: number): Promise<void>;
}
