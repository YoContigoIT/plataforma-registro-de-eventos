import { compare, hash } from "bcrypt";
import type { IEncryptorRepository } from "~/domain/repositories/encrypt.repository";

export const bcryptRepository = (): IEncryptorRepository => {
  const hashPassword = async (password: string) => {
    return await hash(password, 10);
  };

  const comparePassword = async (password: string, passwordHashed: string) => {
    return await compare(password, passwordHashed);
  };

  return {
    hashPassword,
    comparePassword,
  };
};
