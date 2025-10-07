# Documentación: Repositorio bcrypt

## Objetivo
Proveer operaciones de hashing y comparación de contraseñas usando `bcrypt`, expuestas mediante la interfaz de dominio `IEncryptorRepository`.

## Estructura del Repositorio
- Implementa `IEncryptorRepository` del dominio (`~/domain/repositories/encrypt.repository`).
- Expone:
  - `hashPassword(password: string): Promise<string>`
  - `comparePassword(password: string, passwordHashed: string): Promise<boolean>`

## Implementación

```typescript:c%3A%5Cdev%5Cevent-manager%5Capp%5Cinfrastructure%5Cauth%5Cbcrypt.repository.ts
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
```

## Funcionalidades principales
- Hashing de contraseña:
  - Genera un hash con salt administrado por `bcrypt` y cost factor 10.
- Comparación de contraseña:
  - Compara una contraseña en texto plano contra su hash en forma segura.

## Flujos principales
1. Recepción de contraseña del usuario.
2. Hashing usando `bcrypt` con salt y costo configurado.
3. Persistencia del hash en la base de datos.
4. En autenticación, comparación segura de la contraseña contra el hash.

## Consideraciones de uso
- Cost factor (`10`) afecta CPU; ajustarlo según rendimiento y seguridad.
- `bcrypt` incluye protección contra ataques de fuerza bruta al incrementar el costo.
- No loguear contraseñas ni hashes.
- La comparación es constante y segura; evitar comparaciones manuales.

## Ejemplo de uso

```typescript:c%3A%5Cdev%5Cevent-manager%5Cdocumentation%5Cexamples%2Fencryptor-usage.example.ts
import { bcryptRepository } from "@/infrastructure/auth/bcrypt.repository";

const encryptor = bcryptRepository();

export async function registerUser(plainPassword: string) {
  const hashed = await encryptor.hashPassword(plainPassword);
  // guardar 'hashed' en la BD
}

export async function validateLogin(plainPassword: string, storedHash: string) {
  const isValid = await encryptor.comparePassword(plainPassword, storedHash);
  return isValid;
}
```

## Ver también
- `~/domain/repositories/encrypt.repository` (interfaz)
- `documentation/auth/README.md` (visión general de autenticación)