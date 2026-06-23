# FS0003-3 - Modelo User

## Objetivo

Definir el modelo `User` en Prisma y crear la primera migracion de base de datos.

## Cambios incluidos

- Se agrego el modelo `User` en `prisma/schema.prisma`.
- El campo `email` tiene constraint `@unique`.
- Se agregaron los campos requeridos: `id`, `email`, `password`, `name`, `createdAt` y `updatedAt`.

## Migracion

La migracion se genera con:

```bash
npx prisma migrate dev --name create_user
```

## Verificacion

Para verificar la tabla creada:

```bash
npx prisma studio
```

Tambien se puede validar con una query directa en PostgreSQL revisando la tabla `User`.
