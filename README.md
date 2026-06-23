# FS-0003

Amplix Acceleration Program — Javascript.

Aplicación web full-stack con autenticación JWT, roles de usuario y un blog básico.

---

## Tech Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js + Express 5 |
| Frontend | React 19 + Vite 8 |
| Base de datos | PostgreSQL 16 |
| ORM | Prisma 6 |
| Autenticación | JWT (jsonwebtoken) + bcrypt |
| Validación | Joi |
| Cliente HTTP | Axios |
| Contenedores | Docker |

---

## Setup rápido (con Docker)

### Requisitos

- Node.js 20+
- Docker Desktop (instalado y corriendo)

### 1. Clonar el repositorio

```bash
git clone https://github.com/amplixme/FS-0003.git
cd FS-0003
```

### 2. Configurar variables de entorno

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### 3. Iniciar PostgreSQL con Docker

```bash
docker run --name postgres-amplix -e POSTGRES_USER=dev -e POSTGRES_PASSWORD=devs123 -e POSTGRES_DB=my-api -p 5432:5432 -d postgres:16
```

Para **verificar** que el contenedor está corriendo:

```bash
docker ps
```

Para **detener** el contenedor:

```bash
docker stop postgres-amplix
```

Para **iniciarlo** nuevamente:

```bash
docker start postgres-amplix
```

### 4. Instalar dependencias y migrar base de datos

```bash
# Backend
cd backend
npm install
npx prisma db push
npm run dev
```

El backend arranca en `http://localhost:3000`.

### 5. Iniciar el frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

El frontend arranca en `http://localhost:5173`.

---

## Setup sin Docker

Si no usas Docker, necesitas tener PostgreSQL instalado localmente y crear la base de datos con las credenciales del archivo `.env`.

---

## Scripts disponibles

### Backend (`backend/`)

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia servidor con nodemon (hot reload) |
| `npm start` | Inicia servidor en producción |
| `npm run db:push` | Sincroniza schema de Prisma con la BD |
| `npm run db:migrate` | Crea migración de Prisma |
| `npm run db:generate` | Genera el cliente de Prisma |

### Frontend (`frontend/`)

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia servidor de desarrollo Vite |
| `npm run build` | Compila para producción |
| `npm run preview` | Vista previa del build |
| `npm run lint` | Ejecuta ESLint |
| `npm test` | Ejecuta tests con Vitest |

---

## Estructura del proyecto

```
FS-0003/
├── backend/              # API REST (Express + Prisma)
│   ├── prisma/           # Schema y migraciones
│   ├── src/
│   │   ├── controllers/  # Controladores
│   │   ├── middlewares/   # Auth, role, validation, error
│   │   ├── routes/       # Definición de rutas
│   │   ├── services/     # Lógica de negocio
│   │   └── utils/        # Helpers (Prisma client, response)
│   └── .env.example
├── frontend/             # SPA (React + Vite)
│   ├── src/
│   │   ├── components/   # Header, Layout, ProtectedRoute
│   │   ├── context/      # AuthContext
│   │   ├── pages/        # Login, Register
│   │   └── services/     # Axios API client
│   └── .env.example
└── README.md
```

---

## Flujo de trabajo Git

### 1. Crear rama para la tarea

```bash
git checkout develop
git pull origin develop
git checkout -b feature/FS0003-XX-descripcion
```

### 2. Desarrollar y pushear

```bash
git add .
git commit -m "feat: descripción (FS0003-XX)"
git push -u origin feature/FS0003-XX-descripcion
```

### 3. Crear Pull Request a develop

Desde GitHub, crear PR con:
- Base: `develop` ← Head: `feature/FS0003-XX-descripcion`
- Título: `feat: descripción breve (FS0003-XX)`
- Asignar revisores del equipo

### 4. Revisión y merge

- Mínimo **1 aprobación** de un compañero
- Resolver comentarios y conflictos
- Mergear a `develop`

### 5. Release a main

Cuando `develop` está estable:
- PR: `develop` → `main`
- Tag de versión

---

## Convenciones de ramas

| Prefijo | Uso |
|---------|-----|
| `feature/` | Nueva funcionalidad |
| `fix/` | Corrección de bug |
| `hotfix/` | Fix urgente en producción |
| `docs/` | Solo documentación |
| `refactor/` | Refactor sin cambio de comportamiento |

## Convención de commits

```
<tipo>: <descripción corta> (TICKET-ID)

Tipos: feat, fix, docs, refactor, test, chore
Ej: feat: add JWT auth middleware (FS0003-8)
```

---

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del servidor Express |
| `DATABASE_URL` | URL de conexión a PostgreSQL |
| `JWT_SECRET` | Secreto para firmar tokens JWT |

### Frontend (`frontend/.env`)

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL base de la API backend |

---

## Endpoints de la API

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Registrar usuario |
| POST | `/api/auth/login` | No | Iniciar sesión |
| GET | `/api/posts` | No* | Listar posts |
| POST | `/api/posts` | JWT | Crear post |

\* Endpoints de ejemplo, pueden variar según el avance del proyecto.
