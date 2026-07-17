# Nébula

Tienda demo de películas y series (compra/renta) construida con **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4** y **PostgreSQL (Neon)**. Incluye autenticación con dos roles (`admin` / `user`), un catálogo de ~250+ títulos alimentado por **TMDB** (películas, series, tendencias del día y de la semana, reparto, tráilers, reseñas y recomendaciones), pantalla de búsqueda dedicada con filtros completos, favoritos, biblioteca de compras/rentas, perfil con foto guardada en base64, una API REST completa documentada más abajo, modo claro/oscuro y una pasarela de pago simulada (sin cargos reales, con tarjetas de banco temáticas, tarjetas guardadas y billeteras Google/Apple/Samsung Pay).

> ⚠️ Next.js 16 renombró `middleware.ts` → `proxy.ts` (export `proxy` en vez de `middleware`, runtime Node.js obligatorio). Este repo usa la convención nueva — si buscas el middleware, está en `src/proxy.ts`.

## Demo en vivo

Desplegado en Vercel: **https://nebula-javi1771s-projects.vercel.app**

Credenciales de prueba (mismas que genera `pnpm db:seed`):

- **Admin**: `admin@demo.com` / `admin1234`
- **Usuario**: `user@demo.com` / `user1234`

## Clonar el proyecto

```bash
git clone https://github.com/Javi1771/nebula.git
cd nebula
```

## Requisitos

| Requisito | Versión / Nota |
|---|---|
| [Node.js](https://nodejs.org) | 20 o superior |
| [pnpm](https://pnpm.io) | 9 o superior (`npm i -g pnpm`) |
| PostgreSQL | Cualquier Postgres con SSL; se usó [Neon](https://neon.tech) (plan gratuito) |
| Cuenta [TMDB](https://www.themoviedb.org/settings/api) | Gratuita — se necesitan la API key (v3) y el **Read Access Token** (v4, Bearer) |

## Puesta en marcha

1. **Instalar dependencias**:

   ```bash
   pnpm install
   ```

2. **Variables de entorno** — copiar `.env.example` a `.env.local` y completar:

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Descripción |
   |---|---|
   | `DATABASE_URL` | Connection string de Postgres (`postgresql://usuario:password@host/db?sslmode=require`) |
   | `SESSION_SECRET` | String aleatorio largo usado para firmar los JWT de sesión (`openssl rand -hex 32`) |
   | `TMDB_API_KEY` | API key de TMDB (v3) |
   | `TMDB_READ_ACCESS_TOKEN` | Read Access Token de TMDB (v4, Bearer) — es el que usan las llamadas server-side |

3. **Crear las tablas** (idempotente, se puede correr las veces que haga falta):

   ```bash
   pnpm db:migrate
   ```

4. **Poblar el catálogo** — usuarios demo + ~250 títulos (populares, mejor calificados y tendencias del día/semana, con duración, temporadas, episodios, tagline y popularidad de cada uno):

   ```bash
   pnpm db:seed
   ```

   El seed hace *upsert* (no borra compras ni favoritos al re-ejecutarse) y refresca los flags `trending_day` / `trending_week` — córrelo de nuevo cuando quieras actualizar las tendencias. Credenciales creadas:

   - **Admin**: `admin@demo.com` / `admin1234`
   - **Usuario**: `user@demo.com` / `user1234`

5. **(Opcional) Expandir recomendaciones**:

   ```bash
   pnpm db:expand
   ```

   Rastrea las recomendaciones de TMDB de todo el catálogo e importa los títulos faltantes hasta que ~90% de las tarjetas de "También te puede interesar" apunten a fichas que existen en la base.

6. **Levantar el entorno de desarrollo**:

   ```bash
   pnpm dev
   ```

   La app queda en `http://localhost:3000`.

Otros scripts: `pnpm build` (build de producción + type-check), `pnpm lint`.

## Esquema de base de datos

Cuatro tablas normalizadas a 3FN. Todas las PK son `uuid` generadas con `gen_random_uuid()` (extensión `pgcrypto`).

```mermaid
erDiagram
    USERS ||--o{ PURCHASES : realiza
    USERS ||--o{ FAVORITES : marca
    MOVIES ||--o{ PURCHASES : es_objeto_de
    MOVIES ||--o{ FAVORITES : es_marcada_en

    USERS {
        uuid id PK
        text email UK
        text password_hash
        text name
        text role "user | admin"
        numeric balance
        text avatar_url "URL o data-URL base64"
        timestamptz created_at
    }

    MOVIES {
        uuid id PK
        integer tmdb_id UK "junto con media_type"
        text media_type "movie | tv"
        text title
        text year
        text poster_url
        text backdrop_url
        text_array genres
        text overview
        numeric vote_average
        integer runtime "min (por capitulo en series)"
        integer number_of_seasons "solo series"
        integer number_of_episodes "solo series"
        text tagline
        numeric popularity
        boolean trending_day
        boolean trending_week
        numeric price_buy
        numeric price_rent
        timestamptz created_at
    }

    PURCHASES {
        uuid id PK
        uuid user_id FK
        uuid movie_id FK
        text type "buy | rent"
        numeric price
        timestamptz rented_until "solo rentas (48h)"
        timestamptz created_at
    }

    FAVORITES {
        uuid id PK
        uuid user_id FK
        uuid movie_id FK
        timestamptz created_at
    }
```

### `users`

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Identificador del usuario |
| `email` | `text` | `UNIQUE NOT NULL` | Login; se normaliza a minúsculas en el registro |
| `password_hash` | `text` | `NOT NULL` | Hash bcrypt (nunca texto plano) |
| `name` | `text` | `NOT NULL` | Nombre visible |
| `role` | `text` | `NOT NULL DEFAULT 'user'`, `CHECK (role IN ('user','admin'))` | Autorización por rol |
| `balance` | `numeric(10,2)` | `NOT NULL DEFAULT 100.00` | Saldo demo para comprar/rentar |
| `avatar_url` | `text` | nullable | Foto de perfil: URL http(s) o data-URL `data:image/jpeg;base64,...` (la imagen se recorta y comprime a 320px en el navegador antes de guardarse) |
| `created_at` | `timestamptz` | `NOT NULL DEFAULT now()` | Alta de la cuenta |

### `movies`

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Identificador interno del título |
| `tmdb_id` | `integer` | `UNIQUE (tmdb_id, media_type)` parcial (`WHERE tmdb_id IS NOT NULL`) | Id en TMDB; único junto con `media_type` porque TMDB numera películas y series en espacios de ids independientes |
| `media_type` | `text` | `NOT NULL DEFAULT 'movie'`, `CHECK (media_type IN ('movie','tv'))` | Película o serie |
| `title` | `text` | `NOT NULL` | Título localizado (es-MX) |
| `year` | `text` | nullable | Año de estreno / primera emisión |
| `poster_url` | `text` | nullable | Póster (TMDB `w500`) |
| `backdrop_url` | `text` | nullable | Imagen de fondo (TMDB `w1280`) — hero y spotlight |
| `genres` | `text[]` | nullable, índice GIN | Nombres de género localizados |
| `overview` | `text` | nullable | Sinopsis |
| `vote_average` | `numeric(3,1)` | nullable | Calificación TMDB (0–10) |
| `runtime` | `integer` | nullable | Minutos; en series es la duración por capítulo |
| `number_of_seasons` | `integer` | nullable | Temporadas (solo series) |
| `number_of_episodes` | `integer` | nullable | Episodios totales (solo series) |
| `tagline` | `text` | nullable | Lema/frase promocional |
| `popularity` | `numeric(10,2)` | nullable | Índice de popularidad TMDB — orden por defecto del catálogo |
| `trending_day` | `boolean` | `NOT NULL DEFAULT false` | En `/trending/all/day` de TMDB al momento del seed |
| `trending_week` | `boolean` | `NOT NULL DEFAULT false` | En `/trending/all/week` de TMDB al momento del seed |
| `price_buy` | `numeric(10,2)` | `NOT NULL` | Precio de compra |
| `price_rent` | `numeric(10,2)` | `NOT NULL` | Precio de renta (48 h) |
| `created_at` | `timestamptz` | `NOT NULL DEFAULT now()` | Alta en el catálogo |

### `purchases`

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Identificador de la transacción |
| `user_id` | `uuid` | FK → `users(id)` `ON DELETE CASCADE`, índice | Comprador |
| `movie_id` | `uuid` | FK → `movies(id)` `ON DELETE CASCADE`, índice | Título comprado/rentado |
| `type` | `text` | `NOT NULL`, `CHECK (type IN ('buy','rent'))` | Compra permanente o renta |
| `price` | `numeric(10,2)` | `NOT NULL` | Precio pagado (snapshot al momento de la compra) |
| `rented_until` | `timestamptz` | nullable | Solo rentas: expiración (48 h después de rentar) |
| `created_at` | `timestamptz` | `NOT NULL DEFAULT now()` | Fecha de la transacción |

### `favorites`

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Identificador del favorito |
| `user_id` | `uuid` | FK → `users(id)` `ON DELETE CASCADE`, índice | Dueño del favorito |
| `movie_id` | `uuid` | FK → `movies(id)` `ON DELETE CASCADE` | Título marcado |
| `created_at` | `timestamptz` | `NOT NULL DEFAULT now()` | Cuándo se marcó |
| — | — | `UNIQUE (user_id, movie_id)` | Un título solo puede marcarse una vez por usuario |

### Índices

| Índice | Tabla | Tipo | Para qué |
|---|---|---|---|
| `movies_tmdb_id_media_type_idx` | `movies` | `UNIQUE` parcial | Upserts del seed e importaciones del admin sin duplicados |
| `movies_genres_idx` | `movies` | `GIN (genres)` | Filtro por género (`genre = ANY(genres)`) |
| `movies_media_type_idx` | `movies` | btree | Filtro película/serie |
| `purchases_user_id_idx` / `purchases_movie_id_idx` | `purchases` | btree | Biblioteca del usuario y ventas por título |
| `favorites_user_id_idx` | `favorites` | btree | Lista de favoritos del usuario |

**Justificación 3FN**: cada tabla tiene una clave primaria atómica (`uuid`) y todos los atributos no-clave dependen únicamente de esa clave completa, sin dependencias transitivas. `purchases` y `favorites` se modelan como tablas de hechos independientes (con FKs a `users` y `movies`) en vez de embeber historiales dentro de `users` o `movies` — así se evitan grupos repetidos y anomalías de actualización/borrado. `movies` persiste lo que el catálogo y el checkout necesitan (precios, identidad TMDB, ficha técnica, flags de tendencia); lo volátil o pesado — reparto, tráilers, reseñas, recomendaciones — se pide en vivo a TMDB en la página de detalle (`getDetail`, con `append_to_response`) en vez de duplicarlo en la base de datos.

## Endpoints de la API

Todas las rutas viven bajo `src/app/api/**/route.ts`. La auth se resuelve vía cookie de sesión (`session`, httpOnly) — no hace falta un header manual al probar con Postman/el navegador mientras la cookie esté seteada (usa "Send cookies" / la misma sesión del navegador, o replica el `Set-Cookie` recibido en `/api/auth/login`).

| Método | Ruta | Auth | Body / Query | Descripción |
|---|---|---|---|---|
| POST | `/api/auth/register` | — | `{ name, email, password }` | Crea una cuenta (siempre `role: "user"`) y abre sesión |
| POST | `/api/auth/login` | — | `{ email, password }` | Verifica credenciales y setea la cookie de sesión |
| POST | `/api/auth/logout` | sesión | — | Limpia la cookie de sesión |
| POST | `/api/auth/change-password` | sesión | `{ currentPassword, newPassword }` | Cambia la contraseña verificando la actual |
| GET | `/api/movies` | — | `?search=&genre=&type=&collection=&sort=&offset=&limit=` | Catálogo paginado/filtrado. `collection`: `trending_day` \| `trending_week`; `sort`: `popular` (default) \| `rating` \| `recent` \| `title`. Devuelve también los géneros disponibles con conteo |
| POST | `/api/movies` | admin | `{ tmdbId, mediaType, priceBuy, priceRent }` | Importa un título desde TMDB (con ficha técnica completa) y precios definidos por el admin |
| GET | `/api/movies/:id` | — | — | Detalle de un título (fila propia; reparto/tráilers/reseñas/recomendaciones se piden aparte a TMDB desde la página) |
| PUT | `/api/movies/:id` | admin | `{ priceBuy?, priceRent? }` | Actualiza precios |
| DELETE | `/api/movies/:id` | admin | — | Elimina un título del catálogo |
| GET | `/api/purchases` | sesión | — | Historial de compras/rentas del usuario autenticado |
| POST | `/api/purchases` | sesión | `{ movieId, type: "buy"\|"rent" }` | Compra o renta (valida saldo, duplicados y expiración) |
| GET | `/api/favorites` | sesión | — | Favoritos del usuario con la ficha de cada título |
| POST | `/api/favorites` | sesión | `{ movieId }` | Marca un título como favorito |
| DELETE | `/api/favorites` | sesión | `?movieId=` | Quita un favorito |
| GET | `/api/favorites/ids` | sesión | — | Solo los ids (para pintar corazones en las grillas) |
| GET | `/api/users/me` | sesión | — | Perfil propio |
| PATCH | `/api/users/me` | sesión | `{ name?, avatarUrl? }` | Actualiza nombre y/o foto (URL o data-URL base64; `null` la quita) |
| GET | `/api/admin/tmdb-search` | admin | `?q=` | Busca películas/series en TMDB para importar (el token nunca llega al cliente) |
| GET | `/api/admin/stats` | admin | — | Estadísticas del dashboard (usuarios, películas, ventas, ingresos) |
| GET | `/api/users` | admin | — | Listado de usuarios (solo lectura) |

Todos los endpoints devuelven `application/json`; los errores tienen la forma `{ "error": "mensaje", "details"?: {...} }` con el status HTTP correspondiente (400 validación, 401 no autenticado, 402 saldo insuficiente, 403 sin permiso, 404 no encontrado, 409 conflicto).

## Stack

- **Frontend/Backend**: Next.js 16 App Router — páginas de servidor para lectura directa a la DB, componentes cliente (`"use client"`) que consumen la API REST propia vía `fetch` para las partes interactivas (catálogo con filtros/paginación, búsqueda, compra/renta, favoritos, CRUD de admin).
- **Base de datos**: PostgreSQL (Neon), acceso con SQL parametrizado vía [`postgres`](https://github.com/porsager/postgres) (sin ORM).
- **Auth**: JWT firmado (`jose`) en cookie `httpOnly`, passwords con `bcryptjs`.
- **Validación**: `zod` en cada endpoint.
- **API externa**: [TMDB API](https://developer.themoviedb.org/docs) (v3, auth Bearer) para poblar el catálogo y las tendencias — películas, series, reparto, tráilers, reseñas y recomendaciones.
- **Estilos**: Tailwind CSS v4 (config CSS-first vía `@theme` en `globals.css`), sistema de diseño documentado en `desing.md`.

## Estructura de pantallas

| Ruta | Descripción |
|---|---|
| `/` | Catálogo: hero rotativo con las tendencias del día, spotlight del #1, filas de tendencias (hoy/semana) con ranking, cards de género y grilla bento del catálogo |
| `/search` | Búsqueda dedicada: input grande, tipo, orden y todos los géneros como chips (URL compartible: `?q=&genre=&type=`) |
| `/movies/:id` | Detalle: ficha técnica en tiles, tráiler en modal, compra/renta, reparto, reseñas y recomendaciones |
| `/movies/:id/watch` | Reproducción simulada (requiere compra o renta activa) |
| `/favorites` · `/library` | Favoritos y biblioteca (compradas / rentadas con expiración) |
| `/account` | Perfil (nombre + foto), seguridad (cambio de contraseña) y métodos de pago guardados |
| `/login` · `/register` | Auth espejada con animación de deslizamiento y divisor ondulado |
| `/admin` | Dashboard, gestión de títulos (importar de TMDB, precios, eliminar) y usuarios |

## Middlewares

Dos capas independientes, siguiendo el patrón oficial de Next.js 16 (el matcher de `proxy.ts` excluye `/api/*`, así que cada capa cubre una superficie distinta):

- **`src/proxy.ts`** (reemplaza `middleware.ts`): protección a nivel de página — redirige a `/login` si falta sesión en `/admin/*` o `/library`, y saca del área admin a quien no tenga `role: "admin"`.
- **`src/lib/api-middleware.ts`**: `withAuth` / `withAdmin`, higher-order functions que envuelven los route handlers de `/api/*` y devuelven 401/403 antes de ejecutar la lógica del endpoint. `withLogging` es una tercera capa opcional que registra método/ruta/status/duración de cada request — se componen (`withLogging(withAdmin(handler))`).

## Seguridad

- Contraseñas con `bcryptjs` (nunca en texto plano).
- Sesión JWT firmada (`jose`, HS256) en cookie `httpOnly`, `sameSite: lax`, `secure` en producción.
- SQL parametrizado con tagged templates de `postgres` — sin concatenación de strings, sin inyección SQL.
- Validación de entrada con `zod` en el boundary de cada endpoint (400 con detalle de errores si falla); el avatar base64 se valida por formato (`data:image/...`) y tamaño máximo.
- Autorización por rol en el middleware de API (`withAdmin`), no solo en el frontend.
- Las credenciales de TMDB solo se usan server-side (`src/lib/tmdb.ts`, marcado `server-only`); nunca se exponen al cliente.
- Las tarjetas guardadas del checkout demo solo persisten los últimos 4 dígitos, banco y vencimiento en `localStorage` — nunca el número completo ni el CVC.
- Secretos solo en `.env.local` (gitignored, nunca committeado).

## Extras sobre lo mínimo pedido

- Tendencias reales de TMDB (día/semana) con hero rotativo y spotlight del #1.
- Pantalla de búsqueda dedicada con URL compartible y géneros con conteo.
- Favoritos con corazón optimista (se pinta al instante y revierte si el request falla).
- Foto de perfil subible: recorte cuadrado + compresión a 320px JPEG en el navegador, persistida como base64 en Neon.
- Sidebar flotante contraíble (solo iconos; se expande con el mouse) + tabs inferiores en móvil.
- Checkout demo con tarjetas temáticas por banco, tarjeta 3D que gira al enfocar el CVC, validación Luhn, tarjetas guardadas y Google/Apple/Samsung Pay; a 3 columnas en pantallas grandes.
- "Reproducción simulada" (`/movies/:id/watch`) para completar el flujo de compra/renta.
- Sistema de saldo (`balance`) por usuario para simular transacciones sin pasarela real.
- Modo claro/oscuro con toggle persistente y sin parpadeo al cargar; logo adaptativo al tema.
- Notificaciones con `sonner` en los flujos principales (auth, checkout, favoritos, CRUD de admin).

---

Datos e imágenes de [TMDB](https://www.themoviedb.org). Este producto usa la API de TMDB sin ser avalado ni certificado por TMDB.
