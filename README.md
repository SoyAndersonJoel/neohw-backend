# NeoHW Backend

API REST del sistema **NeoHW** — plataforma de e-commerce construida con NestJS, TypeScript y Clean Architecture.

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square&logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)

---

## Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Instalación y Configuración](#instalación-y-configuración)
- [Variables de Entorno](#variables-de-entorno)
- [Base de Datos](#base-de-datos)
- [Scripts Disponibles](#scripts-disponibles)
- [Arquitectura](#arquitectura)
- [Referencia de la API](#referencia-de-la-api)
  - [Autenticación](#autenticación)
  - [Usuarios y Roles](#usuarios-y-roles)
- [Sistema de Roles](#sistema-de-roles)
- [Manejo de Errores](#manejo-de-errores)

---

## Requisitos Previos

| Herramienta | Versión mínima |
|---|---|
| Node.js | 20.x |
| npm | 10.x |
| Docker & Docker Compose | Cualquier versión reciente |
| Git | Cualquier versión reciente |

---

## Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/SoyAndersonJoel/neohw-backend.git
cd neohw-backend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
# Edita .env con tus valores (ver sección Variables de Entorno)
```

### 4. Levantar servicios de infraestructura (PostgreSQL + Redis)
```bash
docker-compose up -d
```

### 5. Ejecutar migraciones de base de datos
```bash
npx prisma migrate deploy
```

### 6. Crear el Super Admin (solo la primera vez)
```bash
npx prisma db seed
```

### 7. Iniciar el servidor
```bash
npm run start:dev
```

El servidor estará disponible en `http://localhost:3000`

---

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# ── Servidor ──────────────────────────────────────
PORT=3000
NODE_ENV=development

# ── Base de Datos ─────────────────────────────────
DATABASE_URL=postgresql://postgres:123456@localhost:5432/neohw_db

# ── JWT ───────────────────────────────────────────
# Genera secretos seguros con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET=tu_secreto_de_acceso_muy_largo
JWT_REFRESH_SECRET=tu_secreto_de_refresh_muy_largo
JWT_ACCESS_TTL=900          # 15 minutos (en segundos)
JWT_REFRESH_TTL=1209600     # 14 días (en segundos)

# ── Redis ─────────────────────────────────────────
REDIS_HOST=localhost
REDIS_PORT=6379

# ── Social Login ──────────────────────────────────
GOOGLE_CLIENT_ID=tu_google_client_id
FACEBOOK_APP_ID=tu_facebook_app_id
FACEBOOK_APP_SECRET=tu_facebook_app_secret

# ── Super Admin (para el seed inicial) ───────────
SUPER_ADMIN_EMAIL=admin@tudominio.com
SUPER_ADMIN_PASSWORD=UnaContraseñaMuySegura123!
```

---

## Base de Datos

### Comandos de Prisma

```bash
# Crear y aplicar una nueva migración (desarrollo)
npx prisma migrate dev --name nombre_de_la_migracion

# Aplicar migraciones existentes (producción)
npx prisma migrate deploy

# Regenerar el cliente de Prisma después de cambios al schema
npx prisma generate

# Abrir Prisma Studio (GUI de la BD)
npx prisma studio

# Crear el Super Admin en la BD
npx prisma db seed
```

### Esquema de Datos

```
User
 ├── id           (UUID)
 ├── email        (único)
 ├── passwordHash (nullable — null para logins sociales)
 ├── provider     (LOCAL | GOOGLE | FACEBOOK)
 ├── providerId   (nullable)
 ├── role         (USER | SELLER | ADMIN | SUPER_ADMIN)
 ├── isActive     (boolean)
 └── refreshTokens[] → RefreshToken

RefreshToken
 ├── id
 ├── userId       → User
 ├── tokenHash
 ├── expiresAt
 ├── revokedAt    (nullable)
 └── replacedByTokenId (nullable — para detección de reuso)
```

---

## Scripts Disponibles

```bash
npm run start:dev    # Servidor con hot-reload (desarrollo)
npm run start:prod   # Servidor en producción
npm run build        # Compilar TypeScript
npm run lint         # Verificar estilo de código
npm run format       # Formatear código con Prettier
npm run test         # Ejecutar tests unitarios
npm run test:cov     # Tests con reporte de cobertura
npm run test:e2e     # Tests end-to-end
```

---

## Arquitectura

El proyecto sigue **Clean Architecture** con separación estricta en capas:

```
src/
├── config/              # Configuración tipada (ConfigService)
├── infrastructure/      # Servicios globales (Prisma, Redis, Cache)
├── common/              # Guards, filtros, interceptors, decorators globales
└── modules/
    ├── auth/
    │   ├── domain/          # Entidades, interfaces, tipos (sin dependencias externas)
    │   ├── application/     # Use cases y lógica de negocio
    │   └── infrastructure/  # Controller, repositorios, estrategias JWT, DTOs
    └── users/
        ├── domain/
        ├── application/
        └── infrastructure/
```

**Principios aplicados:** SOLID · DIP con Symbols · Repository Pattern · Use Case Pattern · Domain Errors

---

## Referencia de la API

**Base URL:** `http://localhost:3000`

---

### Autenticación

#### `POST /auth/register`
Registra un nuevo usuario (rol `USER` por defecto).

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "minimo8caracteres"
}
```

**Respuesta exitosa `201`:**
```json
{
  "accessToken": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "role": "USER"
  }
}
```
> El `refresh_token` se envía automáticamente como cookie `HttpOnly`.

---

#### `POST /auth/login`
Login para **todos los roles** (USER, SELLER, ADMIN, SUPER_ADMIN).

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "tupassword"
}
```

**Respuesta exitosa `200`:**
```json
{
  "accessToken": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "role": "ADMIN"
  }
}
```

---

#### `POST /auth/social/google`
Login o registro con Google (el token lo provee el frontend con Google SDK).

**Body:**
```json
{
  "token": "id_token_de_google"
}
```

**Respuesta exitosa `200`:** (mismo formato que login)

---

#### `POST /auth/social/facebook`
Login o registro con Facebook (el token lo provee el frontend con Facebook SDK).

**Body:**
```json
{
  "token": "access_token_de_facebook"
}
```

**Respuesta exitosa `200`:** (mismo formato que login)

---

#### `POST /auth/refresh`
🔒 Requiere cookie `refresh_token` válida.

Rota el refresh token y emite un nuevo par de tokens.

**Headers:** *(el navegador envía la cookie automáticamente)*

**Respuesta exitosa `200`:**
```json
{
  "accessToken": "eyJhbGci...",
  "user": { "id": "...", "email": "...", "role": "..." }
}
```

---

#### `POST /auth/logout`
🔒 Requiere cookie `refresh_token` válida.

Revoca el refresh token actual.

**Respuesta exitosa `200`:**
```json
{ "success": true }
```

---

#### `GET /auth/me`
🔒 Requiere `Authorization: Bearer <accessToken>`

Devuelve los datos del usuario autenticado desde el JWT (sin tocar la BD).

**Respuesta exitosa `200`:**
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "role": "USER"
  }
}
```

---

### Usuarios y Roles

#### `PATCH /users/:id/role`
🔒 Requiere `Authorization: Bearer <accessToken>`  
🛡️ Solo accesible para **ADMIN** y **SUPER_ADMIN**

Cambia el rol de un usuario existente.

**Parámetros de URL:**
- `:id` — UUID del usuario a modificar

**Body:**
```json
{
  "role": "SELLER"
}
```

> **Valores válidos para `role`:** `USER` | `SELLER` | `ADMIN`
> 
> ⚠️ `SUPER_ADMIN` no se puede asignar desde la API. Solo se crea vía seed.

**Respuesta exitosa `200`:**
```json
{
  "message": "Rol actualizado exitosamente",
  "user": {
    "id": "uuid",
    "email": "vendedor@ejemplo.com",
    "role": "SELLER"
  }
}
```

---

## Sistema de Roles

| Rol | Cómo se obtiene | Permisos clave |
|---|---|---|
| `USER` | Auto-registro (formulario o social) | Comprar productos |
| `SELLER` | Promovido por ADMIN o SUPER_ADMIN | Gestionar sus propios productos |
| `ADMIN` | Promovido solo por SUPER_ADMIN | Panel de administración, promover SELLERs |
| `SUPER_ADMIN` | Seed de base de datos (`npx prisma db seed`) | Control total del sistema |

### Reglas de Promoción

- `SUPER_ADMIN` → puede promover/degradar a cualquier rol (excepto crear otro SUPER_ADMIN)
- `ADMIN` → puede promover a `SELLER` y degradar a `USER`, pero **no puede tocar a otros ADMIN**
- Nadie puede cambiar su propio rol
- Nadie puede modificar el rol de un `SUPER_ADMIN`

---

## Manejo de Errores

La API responde con el formato estándar de NestJS:

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

| Código HTTP | Causa |
|---|---|
| `400 Bad Request` | Body inválido o campos faltantes |
| `401 Unauthorized` | Token inválido, expirado o credenciales incorrectas |
| `403 Forbidden` | Sin permisos para la acción solicitada |
| `404 Not Found` | Recurso no encontrado |
| `409 Conflict` | Email ya registrado |

---

## Autores

- **Anderson Joel** — [@SoyAndersonJoel](https://github.com/SoyAndersonJoel)

---

*Proyecto de Tesis — NeoHW Platform*
