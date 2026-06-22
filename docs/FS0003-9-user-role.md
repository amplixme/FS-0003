# FS0003-9 - Campo role en User

## Objetivo

Agregar roles al modelo `User` para diferenciar administradores y usuarios regulares.

## Cambios incluidos

- Se agrego el enum Prisma `Role` con valores `ADMIN` y `USER`.
- Se agrego `role Role @default(USER)` al modelo `User`.
- Se agrego una migracion para crear el enum y agregar la columna `role` con default `USER`.
- El endpoint `POST /api/auth/register` siempre crea usuarios con `role: 'USER'`.
- El rol enviado en el body del request se ignora y nunca se usa para crear el usuario.
- El payload del JWT ahora incluye `{ userId, email, name, role }`.
- `authMiddleware` expone `req.user` con `{ userId, email, name, role }`.

## Migracion

Con la base de datos disponible, ejecutar:

```bash
npx prisma migrate dev
```

## Primer administrador

Despues de crear el primer usuario, promoverlo con Prisma Studio o query directa:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@ejemplo.com';
```
