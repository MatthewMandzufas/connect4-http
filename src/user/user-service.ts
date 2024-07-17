import { PersistedUser } from "@/user/in-memory-user-repository";
import argon2 from "argon2";
import { isEmpty } from "ramda";
import { CreateUserParams, UserRepository } from "./user-repository";

export class UserAlreadyExistsError extends Error {}
interface UserServiceInterface {
  create: (userDetails: CreateUserParams) => Promise<PersistedUser>;
}

export default class UserService implements UserServiceInterface {
  #userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.#userRepository = userRepository;
  }

  async create(userDetails: CreateUserParams) {
    if (isEmpty(await this.#userRepository.findByEmail(userDetails.email))) {
      return await this.#userRepository.create({
        ...userDetails,
        password: await argon2.hash(userDetails.password),
      });
    } else {
      throw new UserAlreadyExistsError("A user with that email already exists");
    }
  }
}
