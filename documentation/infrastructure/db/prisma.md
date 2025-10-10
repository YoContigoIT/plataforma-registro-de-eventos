# prisma.ts — Cliente Prisma y Transacciones

## Resumen
Provee una instancia única de `PrismaClient` (evitando múltiples conexiones en desarrollo) y un helper `runInTransaction` que asegura el uso del cliente transaccional dentro de un contexto de `AsyncLocalStorage`.

## Ubicación
`app/infrastructure/db/prisma.ts`

## Responsabilidades
- Mantener un singleton de `PrismaClient` y evitar reconexiones excesivas en dev.
- Exponer un `Proxy` que redirige llamadas al cliente transaccional cuando existe.
- Ejecutar funciones dentro de una transacción con `runInTransaction`.

## API pública
- `default export prisma: PrismaClient` (proxy-aware)
- `runInTransaction<T>(callback: () => Promise<T>, options?): Promise<T>`

## Funcionamiento
- `AsyncLocalStorage<PrismaClient>` guarda el cliente transaccional durante la ejecución.
- El `Proxy` intercepta `get` y delega al cliente transaccional si existe en el contexto.
- `runInTransaction` abre una transacción y ejecuta el callback dentro del contexto.

## Ejemplo de uso
```ts
import prisma, { runInTransaction } from "~/app/infrastructure/db/prisma";

await runInTransaction(async () => {
  const user = await prisma.user.create({ data: { /* ... */ } });
  await prisma.session.create({ data: { userId: user.id /* ... */ } });
  // Todas las operaciones dentro del callback usan el cliente transaccional
});
```

## Consideraciones y errores
- No anida transacciones: si ya estás dentro de una, el callback se ejecuta tal cual.
- Maneja `options` de `$transaction` según necesidades (aislamiento, timeout).
- En producción no se guarda la instancia en `globalThis`; en dev sí, para evitar múltiples clientes.

## Mantenimiento
- Evita acceder a `PrismaClient` directo en otras partes; usa el exportado aquí.
- Si cambias la estrategia de transacciones, ajusta el `Proxy` y el `AsyncLocalStorage`.
