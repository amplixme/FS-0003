# Guión de demo — FS-0003

> Duración estimada: 10-12 minutos

---

## 1. Home — Feed de posts *(1 min)*

**Presenta:** Cualquiera

- Abrir `https://fs-0003.vercel.app`
- Mostrar el listado de posts con paginación
- **Punto clave:** Los posts aparecen ordenados por fecha descendente, con autor, categorías y contador de comentarios
- Hacer clic en un post para ver el detalle

---

## 2. Búsqueda y filtros *(1.5 min)*

**Presenta:** Cualquiera

- Escribir en la barra de búsqueda
- **Punto clave:** El debounce de 300ms evita requests innecesarios
- Filtrar por categoría usando el select de ordenamiento
- **Punto clave:** Search + categoría + paginación funcionan juntos

---

## 3. Registro e inicio de sesión *(2 min)*

**Presenta:** Cualquiera

### Registro
- Ir a `/register`
- Completar formulario con nombre, email y contraseña
- **Punto clave:** Validación en frontend y backend (Joi)
- Mostrar error si el email ya existe

### Login
- Ir a `/login`
- Iniciar sesión con credenciales válidas
- **Punto clave:** Se genera token JWT (24h), se redirige al home
- Mostrar error con credenciales inválidas (401)

---

## 4. Perfil de usuario *(1 min)*

**Presenta:** Cualquiera

- Ver perfil público (`/perfil/:id`)
- **Punto clave:** Muestra nombre, bio, avatar y cantidad de posts
- Ir a editar perfil (`/perfil/editar`)
- Cambiar nombre, bio y avatar (subir imagen a Cloudinary)
- **Punto clave:** Subida de imágenes con Multer + Cloudinary, preview antes de guardar

---

## 5. CRUD de posts *(2 min)*

**Presenta:** Cualquiera

### Crear
- Ir a `/crear`
- Completar título, contenido, seleccionar categorías, agregar imagen de portada
- **Punto clave:** Soporta markdown en contenido, categorías many-to-many

### Editar
- Ir a `/posts/:id/editar`
- Modificar título y contenido
- **Punto clave:** Solo el autor o un admin pueden editar (ownership check)

### Eliminar
- Desde el detalle del post, eliminar
- **Punto clave:** Modal de confirmación con foco atrapado, cierre con Escape

---

## 6. Comentarios *(1 min)*

**Presenta:** Cualquiera

- En un post, crear un comentario
- Editar y eliminar comentarios propios
- **Punto clave:** Solo el autor del comentario puede editarlo; admin puede eliminar cualquier comentario

---

## 7. Panel de administración *(2 min)*

**Presenta:** Alguien con rol ADMIN

- Ir a `/admin`
- **Stats:** Mostrar totales de usuarios, posts, comentarios y posts por categoría
- **Users:** Listar, crear, cambiar rol (toggle USER↔ADMIN), editar y eliminar usuarios
  - **Punto clave:** No puedes cambiarte el rol a ti mismo ni eliminarte
- **Posts:** Listar posts recientes, eliminar cualquier post
- **Comments:** Listar comentarios recientes, eliminar cualquier comentario
- **Punto clave:** Todos los botones tienen `type="button"` para evitar envíos de formulario accidentales

---

## Resumen técnico — puntos clave para destacar

| Aspecto | Detalle |
|---------|---------|
| **Arquitectura** | REST API con Express 5 + SPA con React 19 |
| **Auth** | JWT con middleware de autenticación y roles |
| **UX** | Debounce en búsqueda, paginación, skeleton loading |
| **Accesibilidad** | Focus trap en modales, labels en formularios, `:focus-visible` |
| **Calidad** | 46 tests, validación Joi, manejo de errores centralizado |
| **DevOps** | Docker para PostgreSQL, deploy en Vercel + Render |
