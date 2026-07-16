# Nébula — Prueba técnica

Demo de una tienda de películas y series (compra/renta) construida con **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4** y **PostgreSQL (Neon)**. Incluye autenticación con dos roles (`admin` / `user`), un catálogo alimentado por **TMDB** (películas, series, reparto, tráilers, reseñas y recomendaciones), una API REST completa (GET/POST/PUT/DELETE) documentada más abajo, modo claro/oscuro y una pasarela de pago simulada (sin cargos reales, con tarjetas de banco temáticas, tarjetas guardadas y billeteras Google/Apple/Samsung Pay) para comprar o rentar.

> ⚠️ Next.js 16 renombró `middleware.ts` → `proxy.ts` (export `proxy` en vez de `middleware`, runtime Node.js obligatorio). Este repo usa la convención nueva — si buscas el middleware, está en `src/proxy.ts`.

## Stack

- **Frontend/Backend**: Next.js 16 App Router — páginas de servidor para lectura directa a la DB, componentes cliente (`"use client"`) que consumen la API REST propia vía `fetch` para las partes interactivas (catálogo con filtros/paginación, compra/renta, CRUD de admin).
- **Base de datos**: PostgreSQL (Neon), acceso con SQL parametrizado vía [`postgres`](https://github.com/porsager/postgres) (sin ORM).
- **Auth**: JWT firmado (`jose`) en cookie `httpOnly`, passwords con `bcryptjs`.
- **Validación**: `zod` en cada endpoint.
- **API externa**: [TMDB API](https://www.themoviedb.org/documentation/api) (v3, auth Bearer) para poblar el catálogo — películas, series, reparto, tráilers, reseñas y recomendaciones.
- **Estilos**: Tailwind CSS v4 (config CSS-first vía `@theme` en `globals.css`), paleta de color definida en `desing.md`.

## Requisitos

- Node.js 20+
- [pnpm](https://pnpm.io/) 9+
- Una base de datos Postgres (se usó [Neon](https://neon.tech), plan gratuito)
- Una cuenta gratuita de [TMDB](https://www.themoviedb.org/settings/api) con su API key y su Read Access Token (v4, auth Bearer)

## Configuración local

1. Instalar dependencias:

   ```bash
   pnpm install
   ```

2. Copiar `.env.example` a `.env.local` y completar las variables:

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Descripción |
   |---|---|
   | `DATABASE_URL` | Connection string de Postgres (`postgresql://usuario:password@host/db?sslmode=require`) |
   | `SESSION_SECRET` | String aleatorio largo usado para firmar los JWT de sesión |
   | `TMDB_API_KEY` | API key de TMDB (v3) |
   | `TMDB_READ_ACCESS_TOKEN` | Read Access Token de TMDB (v4, Bearer) — es el que usan las llamadas server-side |

3. Crear las tablas:

   ```bash
   pnpm db:migrate
   ```

4. Poblar usuarios demo y ~22 títulos populares (películas y series) desde TMDB:

   ```bash
   pnpm db:seed
   ```

   Credenciales creadas:
   - **Admin**: `admin@demo.com` / `admin1234`
   - **Usuario**: `user@demo.com` / `user1234`

5. Levantar el entorno de desarrollo:

   ```bash
   pnpm dev
   ```

   La app queda en `http://localhost:3000`.

Otros scripts: `pnpm build` (build de producción + type-check), `pnpm lint`.

## Esquema de base de datos

Tres tablas, normalizadas a 3FN:

```mermaid
erDiagram
    USERS ||--o{ PURCHASES : realiza
    MOVIES ||--o{ PURCHASES : es_objeto_de

    USERS {
        uuid id PK
        text email UK
        text password_hash
        text name
        text role "user | admin"
        numeric balance
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
        timestamptz rented_until
        timestamptz created_at
    }
```

**Justificación 3FN**: cada tabla tiene una clave primaria atómica (`uuid`) y todos los atributos no-clave dependen únicamente de esa clave completa, sin dependencias transitivas. `purchases` se modela como una tabla de hechos independiente (con FKs a `users` y `movies`) en vez de embeber el historial de compras dentro de `users` o `movies` — así se evitan grupos repetidos y anomalías de actualización/borrado. `movies` guarda solo lo que necesita persistir para el catálogo y el checkout (precios, identidad TMDB, campos de presentación); todo lo volátil o pesado — reparto, tráilers, reseñas, recomendaciones — se pide en vivo a TMDB en la página de detalle (`getDetail`, con `append_to_response`) en vez de duplicarlo en la base de datos. `tmdb_id` es único en combinación con `media_type` porque TMDB numera películas y series en espacios de ids independientes.

## Endpoints de la API

Todas las rutas viven bajo `src/app/api/**/route.ts`. La auth se resuelve vía cookie de sesión (`session`, httpOnly) — no hace falta un header manual al probar con Postman/el navegador mientras la cookie esté seteada (usa "Send cookies" / la misma sesión del navegador, o replica el `Set-Cookie` recibido en `/api/auth/login`).

| Método | Ruta | Auth | Body / Query | Descripción |
|---|---|---|---|---|
| POST | `/api/auth/register` | — | `{ name, email, password }` | Crea una cuenta (siempre `role: "user"`) y abre sesión |
| POST | `/api/auth/login` | — | `{ email, password }` | Verifica credenciales y setea la cookie de sesión |
| POST | `/api/auth/logout` | sesión | — | Limpia la cookie de sesión |
| GET | `/api/movies` | — | `?search=&genre=&type=&offset=&limit=` | Catálogo paginado/filtrado (título, género, película/serie) + lista de géneros disponibles |
| POST | `/api/movies` | admin | `{ tmdbId, mediaType, priceBuy, priceRent }` | Importa un título desde TMDB con precios definidos por el admin |
| GET | `/api/movies/:id` | — | — | Detalle de un título (fila propia; reparto/tráilers/reseñas/recomendaciones se piden aparte a TMDB desde la página) |
| PUT | `/api/movies/:id` | admin | `{ priceBuy?, priceRent? }` | Actualiza precios |
| DELETE | `/api/movies/:id` | admin | — | Elimina un título del catálogo |
| GET | `/api/purchases` | sesión | — | Historial de compras/rentas del usuario autenticado |
| POST | `/api/purchases` | sesión | `{ movieId, type: "buy"\|"rent" }` | Compra o renta (valida saldo, duplicados y expiración) |
| GET | `/api/admin/tmdb-search` | admin | `?q=` | Busca películas/series en TMDB para importar (el token nunca llega al cliente) |
| GET | `/api/admin/stats` | admin | — | Estadísticas del dashboard (usuarios, películas, ventas, ingresos) |
| GET | `/api/users` | admin | — | Listado de usuarios (solo lectura) |

Todos los endpoints devuelven `application/json`; los errores tienen la forma `{ "error": "mensaje", "details"?: {...} }` con el status HTTP correspondiente (400 validación, 401 no autenticado, 402 saldo insuficiente, 403 sin permiso, 404 no encontrado, 409 conflicto).

## Middlewares

Dos capas independientes, siguiendo el patrón oficial de Next.js 16 (el matcher de `proxy.ts` excluye `/api/*`, así que cada capa cubre una superficie distinta):

- **`src/proxy.ts`** (reemplaza `middleware.ts`): protección a nivel de página — redirige a `/login` si falta sesión en `/admin/*` o `/library`, y saca del área admin a quien no tenga `role: "admin"`.
- **`src/lib/api-middleware.ts`**: `withAuth` / `withAdmin`, higher-order functions que envuelven los route handlers de `/api/*` y devuelven 401/403 antes de ejecutar la lógica del endpoint. `withLogging` es una tercera capa opcional que registra método/ruta/status/duración de cada request — se componen (`withLogging(withAdmin(handler))`).

## Seguridad

- Contraseñas con `bcryptjs` (nunca en texto plano).
- Sesión JWT firmada (`jose`, HS256) en cookie `httpOnly`, `sameSite: lax`, `secure` en producción.
- SQL parametrizado con tagged templates de `postgres` — sin concatenación de strings, sin inyección SQL.
- Validación de entrada con `zod` en el boundary de cada endpoint (400 con detalle de errores si falla).
- Autorización por rol en el middleware de API (`withAdmin`), no solo en el frontend.
- Las credenciales de TMDB solo se usan server-side (`src/lib/tmdb.ts`, marcado `server-only`); nunca se exponen al cliente.
- Las tarjetas guardadas del checkout demo solo persisten los últimos 4 dígitos, banco y vencimiento en `localStorage` — nunca el número completo ni el CVC.
- Secretos solo en `.env.local` (gitignored, nunca committeado).

## Notas de frontend

- El catálogo (`/`) es un componente cliente (`CatalogClient`) que llena la grilla llamando a `/api/movies` vía `fetch`, con un segmentado Película/Serie, tabs de género y un botón "Cargar más" (paginación por `offset`/`limit`) — todo manipulado con JavaScript/DOM sin recargar la página.
- Grid responsive (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`) en catálogo, biblioteca y resultados de búsqueda de TMDB.
- La página de detalle combina la fila propia (precios, id) con una llamada en vivo a TMDB (`getDetail`, `append_to_response=videos,credits,reviews,recommendations`) para tráiler, reparto, reseñas y "también te puede interesar" — las recomendaciones solo se muestran si ya están en nuestro catálogo, para no enlazar a páginas inexistentes.
- La gestión de títulos del admin (`/admin/movies`) es CRUD completo contra la API REST (buscar/importar desde TMDB, editar precios inline, eliminar con confirmación), reutilizable 1:1 desde Postman.

## Extras sobre lo mínimo pedido

- JWT de sesión (marcado como opcional en el rubric).
- Middleware de logging componentizado (`withLogging`) además de auth/admin.
- "Reproducción simulada" (`/movies/:id/watch`) para completar el flujo de compra/renta sin necesitar un backend de streaming real.
- Sistema de saldo (`balance`) por usuario para simular transacciones reales sin pasarela de pago.
- Checkout demo con tarjetas temáticas por banco (BBVA, Santander, HSBC, Mercado Pago, DiDi Card, Rappi Card...), tarjetas guardadas en `localStorage` y simulación de Google Pay / Apple Pay / Samsung Pay.
- Notificaciones con `sonner` en los flujos principales (auth, checkout, CRUD de admin).
- Modo claro/oscuro con toggle persistente y sin parpadeo al cargar.
