# Jules

Jules is an authentication-only foundation for an AI chat application. The API is an Express/JavaScript service backed by MongoDB, and the React/Vite client uses Redux Toolkit.

## Requirements

- Node.js 20+
- MongoDB (Atlas or local)

## Setup

1. Copy `server/.env.example` to `server/.env` and set:
   - `MONGODB_URI`
   - `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` (different random strings, 32+ characters each)
   - `GROQ_API_KEY`

2. Start the API:

   ```sh
   cd server
   npm install
   npm run dev
   ```

3. In another terminal, start the client:

   ```sh
   cd client
   npm install
   npm run dev
   ```

The client runs at `http://localhost:5173` and the API at `http://localhost:5000`. Vite proxies `/api` to the backend, so no CORS setup is needed in development.

## Authentication API

Success response: `{ "success": true, "message": "...", "data": {} }`
Failure response: `{ "success": false, "message": "...", "errors": [] }`

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/v1/auth/register` | Create an account |
| POST | `/api/v1/auth/login` | Log in |
| POST | `/api/v1/auth/refresh` | Rotate tokens using the refresh cookie |
| POST | `/api/v1/auth/logout` | Log out |
| GET | `/api/v1/auth/me` | Get the current user (Bearer token) |

### Example: register

```json
{
  "name": "Alex Morgan",
  "email": "alex@example.com",
  "password": "securepass1"
}
```

## Project structure

- `server/` Express API
- `client/` React + Vite app
- `client/src/features/auth` auth feature (api, state, hooks, ui)
- `client/src/features/conversation` chat workspace (history stored in browser local storage)