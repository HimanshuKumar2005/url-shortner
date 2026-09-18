# shortner

A low-latency URL shortener built with React, Express, MongoDB, Redis, and Docker.

## Run locally

1. Start MongoDB and Redis, or run `docker compose up mongo redis`.
2. In `server`, copy `.env.example` to `.env`, then run `npm install` and `npm run dev`.
3. In `client`, run `npm install` and `npm run dev`.
4. Open http://localhost:5173.

## Run everything with Docker

```bash
docker compose up --build
```

The dashboard is at http://localhost:5173 and the API is at http://localhost:4000.

## Server structure

- `server/src/index.js` configures middleware, database clients, dependency injection, and startup.
- `server/src/routes/apiRoutes.js` defines `/api/health`, `/api/shorten`, and `/api/analytics/:shortKey`.
- `server/src/routes/redirectRoutes.js` defines the public `/:shortKey` redirect route.
- `server/src/controllers/urlController.js` contains validation, ID generation, caching, redirects, and analytics behavior.
- `server/src/models` and `server/src/services` isolate persistence and infrastructure concerns.

## API

- `POST /api/shorten` with `{ "longUrl": "https://example.com/path" }`
- `GET /:shortKey` returns a 301 redirect
- `GET /api/analytics/:shortKey` returns click and link metadata
- `POST /api/auth/register` with `{ "name": "Ada", "email": "ada@example.com", "password": "at-least-8-chars" }`
- `POST /api/auth/login` with `{ "email": "ada@example.com", "password": "at-least-8-chars" }`
- `POST /api/auth/google` with a Google Identity Services credential
- `GET /api/urls` returns the authenticated user's saved links and requires `Authorization: Bearer <token>`
- `GET /api/health` returns service health

Each API instance reserves a 1,000,000-ID block from Redis using an atomic `INCRBY`, then encodes IDs into fixed seven-character Base62 keys.

## Authentication

Authentication is optional. Anonymous links are kept in browser `sessionStorage` and are available only for that browser session. Registered links are associated with the user's account and loaded from MongoDB after login. Set a strong `JWT_SECRET` in `server/.env` before deployment.

Google sign-in is supported through Google Identity Services. Set `GOOGLE_CLIENT_ID` in the server environment and `VITE_GOOGLE_CLIENT_ID` when building the client. The Google OAuth client must allow the client origin (for example, `http://localhost:5173`).
