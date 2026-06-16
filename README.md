# Storefront Backend API

A RESTful API backend for a storefront application. Built using **TypeScript, Express, PostgreSQL**.

---

## Technologies Used

| Technology | Description |
|------------|-------------|
| Framework | Express.js |
| Authentication | JWT + Bcrypt |
| Database | PostgreSQL + db-migrate |
| Testing | Jasmine + Supertest |
| Security | CORS + Helmet |

---

## Setup

### 1. Requirements
- Node.js
- Yarn package manager
- Docker Desktop

### 2. Steps

> **Note**: You can edit the `.env` file to your preferences before you proceed with the remaining steps (optional).

```bash
yarn install
cp .env.example .env
# Customize here
docker-compose up -d
yarn db:init
yarn migrate:up
```

---

## Controls and Scripts

### Database Migrations

| Command | Description |
|---------|-------------|
| `yarn migrate:up` | Apply migrations for deployment/development database |
| `yarn migrate:down` | Rollback the last migration for deployment/development database |
| `yarn migrate:up <number>` | Apply the last <number> migrations for deployment/development database |
| `yarn migrate:down <number>` | Rollback the last <number> migrations for deployment/development database |

### Running the Application

| Command | Description |
|---------|-------------|
| `yarn server:dev` | Run the application in development watch mode |
| `yarn server:run` | Run the application in production mode |

### Testing

> **Note**: The tests run on an isolated test environment database.

| Command | Description |
|---------|-------------|
| `yarn test` | Run the tests |

---

## API Documentation & Routes

For details on REST routes, verbs, and authentication requirements, please refer to the [REQUIREMENTS.md](REQUIREMENTS.md) file.