# FS-0003
Amplix Acceleration Program — Javascript

## Flujo de trabajo Git

### 1. Crear rama para la tarea
```bash
# Estar en develop actualizado
git checkout develop
git pull origin develop

# Crear rama feature con nombre del ticket
git checkout -b feature/FS0003-XX-descripcion-corta
```

### 2. Desarrollar la funcionalidad
- Hacer commits atómicos y descriptivos
- Ejecutar tests y linters localmente
- `git push -u origin feature/FS0003-XX-descripcion-corta`

### 3. Crear Pull Request a develop
- Base: `develop` ← Head: `feature/FS0003-XX-descripcion-corta`
- Título: `feat: descripción breve (FS0003-XX)`
- Descripción: qué hace, cómo probar, breaking changes
- Asignar reviewers del equipo

### 4. Revisión y aprobación
- Mínimo **1 aprobación** de un compañero
- Resolver comentarios y conflictos si los hay
- CI/CD debe pasar (tests, lint, build)

### 5. Merge a develop
- Merge squash o merge commit (según política del equipo)
- Eliminar rama feature remota y local
- `git checkout develop && git pull origin develop`

### 6. Release a main
- Cuando `develop` está estable y listo para producción
- PR: `develop` → `main`
- Tag de versión: `v1.0.0`
- Deploy automático a producción

---

## Convenciones de ramas
| Prefijo | Uso |
|---------|-----|
| `feature/` | Nueva funcionalidad (ej: `feature/FS0003-8-auth-middleware`) |
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

## Variables de entorno
Copiar `.env.example` a `.env` y completar valores:
```bash
cp .env.example .env
```

## Scripts útiles
```bash
npm run dev        # Desarrollo con nodemon
npm run start      # Producción
npm run lint       # Linter (configurar)
npm run test       # Tests (configurar)
```