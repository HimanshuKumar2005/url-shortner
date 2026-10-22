# shortner

A low-latency URL shortener built with React, Express, MongoDB, Redis, and Docker.

## Features

- Shorten valid HTTP and HTTPS URLs into fixed seven-character Base62 links.
- Redirect short links to their original destinations with HTTP 301 redirects.
- Add a custom label to every shortened URL.
- Generate sequential default labels such as `label1`, `label2`, and `label3` when no label is provided.
- Edit link labels after creation from the dashboard using inline editing.
- Validate and limit labels to 80 characters.
- View all saved links in the dashboard with their labels, destinations, creation dates, and click counts.
- View analytics for any shortened URL, including total clicks, creation date, and short key.
- Copy short links or open them in a new browser tab from the result and dashboard views.
- Create links anonymously or authenticate with an account to save links permanently.
- Register and log in with email and password, or use Google sign-in.
- Keep anonymous links in browser `sessionStorage` for the current browser session.
- Store authenticated links in MongoDB and cache redirects in Redis.
- Allocate ID ranges atomically through Redis for safe multi-instance operation.
- Rate-limit link creation per IP address or authenticated user.
- Reject automated submissions through a honeypot field.
- Block localhost, private-network, link-local, and configured unsafe destination domains.
- Expose a health endpoint for service monitoring.
- Run the complete application with Docker Compose.

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
- `server/src/routes/apiRoutes.js` defines health, shortening, label update, authentication, saved-link, and analytics endpoints.
- `server/src/routes/redirectRoutes.js` defines the public `/:shortKey` redirect route.
- `server/src/controllers/urlController.js` contains validation, ID generation, caching, redirects, and analytics behavior.
- `server/src/models` and `server/src/services` isolate persistence and infrastructure concerns.

## API

- `POST /api/shorten` with `{ "longUrl": "https://example.com/path", "label": "Documentation" }`. The `label` field is optional.
- `GET /:shortKey` returns a 301 redirect
- `GET /api/analytics/:shortKey` returns click and link metadata
- `PATCH /api/urls/:shortKey` with `{ "label": "Updated label" }` updates the label for the link owner
- `POST /api/auth/register` with `{ "name": "Ada", "email": "ada@example.com", "password": "at-least-8-chars" }`
- `POST /api/auth/login` with `{ "email": "ada@example.com", "password": "at-least-8-chars" }`
- `POST /api/auth/google` with a Google Identity Services credential
- `GET /api/urls` returns the authenticated user's saved links and requires `Authorization: Bearer <token>`
- `GET /api/health` returns service health

Each API instance reserves a 1,000,000-ID block from Redis using an atomic `INCRBY`, then encodes IDs into fixed seven-character Base62 keys.

## Authentication

Authentication is optional. Anonymous links are kept in browser `sessionStorage` and are available only for that browser session. Registered links are associated with the user's account and loaded from MongoDB after login. Set a strong `JWT_SECRET` in `server/.env` before deployment.

Google sign-in is supported through Google Identity Services. Set `GOOGLE_CLIENT_ID` in the server environment and `VITE_GOOGLE_CLIENT_ID` when building the client. The Google OAuth client must allow the client origin (for example, `http://localhost:5173`).

## Abuse protection configuration

The server applies a default limit of 30 shortening requests per 15 minutes for each IP address or authenticated user. Configure these values in the server environment:

- `SHORTEN_RATE_LIMIT_WINDOW_MS` controls the rate-limit window in milliseconds.
- `SHORTEN_RATE_LIMIT_MAX` controls the maximum shortening requests per window.
- `BLOCKED_DOMAINS` accepts a comma-separated list of domains and subdomains to reject, such as `example-malware.test,phishing.test`.

Private destinations such as `localhost`, loopback addresses, link-local addresses, and RFC1918 private IPv4 ranges are blocked by default. This protects the service from being used to create links to internal systems.
