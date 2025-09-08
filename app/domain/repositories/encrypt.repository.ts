export interface IEncryptorRepository {
  hashPassword: (password: string) => Promise<string>;
  comparePassword: (password: string, passwordHashed: string) => Promise<boolean>;
}
