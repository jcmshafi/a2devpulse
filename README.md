# DevPulse

DevPulse is a TypeScript, Express, and PostgreSQL REST API for tracking software issues. It supports user authentication, role-based authorization, and issue management for contributors and maintainers.

## Links

- **Live API:** https://a2devpulse-steel.vercel.app/
- **GitHub Repo:** https://github.com/jcmshafi/a2devpulse
## Features

- User signup and login with JWT authentication
- Password hashing with bcrypt
- Contributor and maintainer roles
- Create, read, update, and delete issues
- Issue filtering by type and status
- Issue sorting by newest or oldest
- Global error handling with consistent JSON responses
- PostgreSQL table initialization on server startup

## Tech Stack

- Node.js
- Express 5
- TypeScript
- PostgreSQL
- JWT
- bcrypt
- tsx

## Project Structure

```txt
src/
  app.ts
  server.ts
  config/
    db.ts
  db/
    initDB.ts
  middlewares/
    auth.ts
    authorize.ts
    globalErrorHandler.ts
  modules/
    auth/
    issue/
  utils/
  types/
```

## Getting Started

### Prerequisites

- Node.js
- npm
- PostgreSQL database

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/devpulse
JWT_SECRET=your_jwt_secret
```

### Run In Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Run Production Build

```bash
npm start
```

The API root should respond at:

```txt
GET /
```

Response:

```json
{
  "success": true,
  "message": "DevPulse API Running"
}
```

## Database

The server automatically creates the required tables on startup if they do not already exist.

### Schema

**users**

| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PRIMARY KEY | |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(150) | NOT NULL, UNIQUE |
| password | TEXT | bcrypt hashed |
| role | VARCHAR(20) | `contributor` or `maintainer`, default `contributor` |
| created_at | TIMESTAMP | default NOW() |

**issues**

| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PRIMARY KEY | |
| title | VARCHAR(150) | NOT NULL |
| description | TEXT | NOT NULL, min 20 chars |
| type | VARCHAR(30) | `bug` or `feature_request` |
| status | VARCHAR(20) | `open`, `in_progress`, or `resolved`, default `open` |
| user_id | INTEGER | FK → users.id |
| created_at | TIMESTAMP | default NOW() |

## Authentication

Protected routes expect the JWT token in the `Authorization` header.

```txt
Authorization: <token>
```

## API Endpoints

### Auth

#### Register User

```txt
POST /api/auth/signup
```

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "contributor"
}
```

The `role` field is optional and defaults to `contributor`.

#### Login User

```txt
POST /api/auth/login
```

Request body:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Successful login returns a token and user data.

### Issues

#### Create Issue

```txt
POST /api/issues
```

Access:

- `contributor`
- `maintainer`

Request body:

```json
{
  "title": "Login button does not work",
  "description": "Clicking the login button does not submit the form.",
  "type": "bug"
}
```

Validation rules:

- `title` must be 150 characters or fewer
- `description` must be at least 20 characters
- `type` must be `bug` or `feature_request`

#### Get All Issues

```txt
GET /api/issues
```

Optional query parameters:

```txt
type=bug
status=open
sort=newest
```

Example:

```txt
GET /api/issues?type=bug&status=open&sort=oldest
```

#### Get Single Issue

```txt
GET /api/issues/:id
```

#### Update Issue

```txt
PATCH /api/issues/:id
```

Access:

- `contributor`
- `maintainer`

Request body:

```json
{
  "title": "Updated issue title",
  "description": "Updated issue description with enough detail.",
  "type": "feature_request",
  "status": "in_progress"
}
```

Contributor rules:

- Contributors can only update their own issues
- Contributors can only update issues while the status is `open`
- Contributors cannot change issue status

Maintainers can update issue status.

#### Delete Issue

```txt
DELETE /api/issues/:id
```

Access:

- `maintainer`

## Available Scripts

```bash
npm run dev
```

Runs the development server with file watching.

```bash
npm run build
```

Compiles TypeScript into the `dist` directory.

```bash
npm start
```

Runs the compiled production server.

## Notes

- JWT tokens expire after 7 days.
- The API uses JSON request bodies.
- CORS is enabled globally.
