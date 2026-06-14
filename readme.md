# Task Manager API

A professional, versioned RESTful API built with Node.js, Express, Prisma, and MySQL. This project covers user authentication with JWT, protected routes, CRUD operations, input validation, pagination, rate limiting, global error handling, and automated testing.

---

## 🛠️ Tech Stack

| Tool | Purpose |
|---|---|
| **Node.js** | Runtime environment |
| **Express** | HTTP server framework |
| **Prisma 7** | ORM for database access |
| **MySQL (Laragon)** | Relational database |
| **bcryptjs** | Password hashing |
| **jsonwebtoken** | JWT authentication |
| **Zod** | Request validation |
| **express-rate-limit** | API rate limiting |
| **Jest** | Test runner |
| **Supertest** | HTTP integration testing |
| **dotenv** | Environment variables |
| **nodemon** | Auto-restart in development |
| **cross-env** | Cross-platform environment variables |

---

## 📁 Project Structure

```
task-manager/
├── prisma/
│   └── schema.prisma            # Database schema
├── src/
│   ├── __tests__/
│   │   ├── setup.js             # Test DB setup & cleanup
│   │   ├── auth.test.js         # Auth route tests
│   │   └── tasks.test.js        # Task route tests
│   ├── config/
│   │   └── prisma.js            # Prisma client (env-aware: dev/test DB)
│   ├── controllers/
│   │   ├── authController.js    # Register & Login logic
│   │   └── taskController.js    # CRUD task logic
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT protection
│   │   ├── validateMiddleware.js   # Zod validation
│   │   ├── errorMiddleware.js      # Global error handler
│   │   └── rateLimitMiddleware.js  # API & auth rate limiters
│   ├── routes/
│   │   └── v1/
│   │       ├── index.js         # Aggregates all v1 routes
│   │       ├── authRoutes.js    # Auth endpoints
│   │       └── taskRoutes.js    # Task endpoints
│   ├── validators/
│   │   ├── authValidator.js     # Register & Login schemas
│   │   └── taskValidator.js     # Create & Update schemas
│   ├── app.js                   # Express app setup (exported for testing)
│   └── server.js                # Starts the HTTP server
├── prisma.config.ts             # Prisma 7 connection config (env-aware)
├── .env                          # Environment variables
├── .gitignore
└── package.json
```

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Laragon](https://laragon.org/) or any MySQL/MariaDB server
- [Postman](https://www.postman.com/) or Thunder Client for testing

### Installation

```bash
# Clone the repository
git clone https://github.com/alatos2/task-manager-api.git
cd task-manager-api

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate
```

### Environment Setup

Create a `.env` file in the root of your project:

```env
DATABASE_URL="mysql://root:@localhost:3306/taskmanager"
TEST_DATABASE_URL="mysql://root:@localhost:3306/taskmanager_test"
JWT_SECRET=your_super_secret_key_here
PORT=4000
```

### Database Setup

Create the database in MySQL first:

```sql
CREATE DATABASE taskmanager;
```

Then run Prisma migrations:

```bash
npx prisma migrate dev --name init
```

> 💡 The test database (`taskmanager_test`) is created and migrated automatically when you run `npm test`.

### Run the Server

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:4000`

---

## 🗄️ Database Schema

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  tasks     Task[]
  createdAt DateTime @default(now())
}

model Task {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  completed   Boolean  @default(false)
  userId      Int
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
}
```

---

## 🔐 Authentication

This API uses **JWT (JSON Web Tokens)** for authentication.

- Passwords are hashed using **bcryptjs** before storage (salt rounds: 10 in production, 1 in tests for speed)
- On login, a JWT token is returned (expires in 7 days)
- Protected routes require the token in the `Authorization` header:

```
Authorization: Bearer <your_token_here>
```

---

## 🔢 API Versioning

All routes are prefixed with `/api/v1/`. This allows future breaking changes to be introduced under `/api/v2/` without affecting existing clients.

```
src/routes/v1/index.js   →  registered once in app.js as app.use('/api/v1', v1Routes)
```

---

## 📡 API Endpoints

### Auth Routes

| Method | Endpoint | Description | Auth Required | Rate Limited |
|---|---|---|---|---|
| POST | `/api/v1/auth/register` | Register a new user | ❌ | ✅ (10/15min) |
| POST | `/api/v1/auth/login` | Login and get JWT token | ❌ | ✅ (10/15min) |

### Task Routes

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/v1/tasks` | Create a new task | ✅ |
| GET | `/api/v1/tasks` | Get paginated tasks for logged in user | ✅ |
| PUT | `/api/v1/tasks/:id` | Update a task by ID | ✅ |
| DELETE | `/api/v1/tasks/:id` | Delete a task by ID | ✅ |

---

## 📝 Request & Response Examples

### Register

**Request:**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Tosin Alabi",
  "email": "tosin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User created",
  "user": {
    "id": 1,
    "name": "Tosin Alabi",
    "email": "tosin@example.com",
    "createdAt": "2026-06-01T22:13:43.183Z"
  }
}
```

---

### Login

**Request:**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "tosin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Create Task

**Request:**
```http
POST /api/v1/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Learn Node.js",
  "description": "Build a REST API with Express and Prisma"
}
```

**Response:**
```json
{
  "message": "Task created",
  "task": {
    "id": 1,
    "title": "Learn Node.js",
    "description": "Build a REST API with Express and Prisma",
    "completed": false,
    "userId": 1,
    "createdAt": "2026-06-01T22:13:43.183Z"
  }
}
```

---

### Get All Tasks (Paginated)

**Request:**
```http
GET /api/v1/tasks?page=1&limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Learn Node.js",
      "description": "Build a REST API with Express and Prisma",
      "completed": false,
      "userId": 1,
      "createdAt": "2026-06-01T22:13:43.183Z"
    }
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

> 💡 `page` defaults to `1` and `limit` defaults to `10` if not provided.

---

### Update Task

**Request:**
```http
PUT /api/v1/tasks/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "message": "Update successful",
  "task": {
    "id": 1,
    "title": "Updated title",
    "description": "Updated description",
    "completed": false,
    "userId": 1,
    "createdAt": "2026-06-01T22:13:43.183Z"
  }
}
```

---

### Delete Task

**Request:**
```http
DELETE /api/v1/tasks/1
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Task deleted successfully"
}
```

---

## ✅ Validation Rules

### Register
| Field | Rules |
|---|---|
| name | Required, minimum 2 characters |
| email | Required, valid email format |
| password | Required, minimum 6 characters |

### Login
| Field | Rules |
|---|---|
| email | Required, valid email format |
| password | Required |

### Create Task
| Field | Rules |
|---|---|
| title | Required, maximum 255 characters |
| description | Optional |

### Update Task
| Field | Rules |
|---|---|
| title | Optional, maximum 255 characters |
| description | Optional |
| (at least one field) | At least one of `title` or `description` must be provided |

---

## 🚨 Error Responses

| Status Code | Meaning |
|---|---|
| `400` | Bad request / invalid input |
| `401` | Unauthorized / invalid or missing token |
| `404` | Resource not found |
| `409` | Conflict / duplicate entry |
| `422` | Validation failed |
| `429` | Too many requests (rate limit exceeded) |
| `500` | Internal server error |

**Validation Error Example:**
```json
{
  "errors": [
    { "field": "email", "message": "Invalid email address" },
    { "field": "password", "message": "Password must be at least 6 characters" }
  ]
}
```

**Rate Limit Error Example:**
```json
{
  "message": "Too many auth attempts, please try again after 15 minutes"
}
```

---

## 🚦 Rate Limiting

| Scope | Limit | Window |
|---|---|---|
| All `/api` routes | 100 requests | 15 minutes |
| `/api/v1/auth/*` routes | 10 requests | 15 minutes |

> 💡 Auth routes have a stricter limit to prevent brute-force login/registration attacks. Rate limit info is returned via standard `RateLimit-*` response headers.

---

## 🧪 Testing

This project uses **Jest** and **Supertest** for automated integration testing against a dedicated test database (`taskmanager_test`).

### How It Works

- `NODE_ENV=test` switches Prisma to the test database automatically (`src/config/prisma.js` and `prisma.config.ts`)
- `src/__tests__/setup.js`:
  - Creates the test database if it doesn't exist
  - Runs migrations against it (`prisma migrate deploy`)
  - Clears all tables **before each test** (`beforeEach`)
  - Disconnects Prisma after all tests (`afterAll`)
- bcrypt salt rounds are reduced to `1` in test mode for faster test runs

### Run Tests

```bash
npm test
```

### Test Coverage

| Suite | Tests |
|---|---|
| **Auth Routes** | Register success, validation failure, duplicate email, login success, wrong password |
| **Task Routes** | Create task, create without token, create with invalid data, paginated list, list without token, update task, delete task |

---

## 🔒 Security Features

- Passwords hashed with **bcryptjs**
- JWT tokens expire after **7 days**
- Passwords never returned in API responses
- Protected routes require valid JWT token
- Input validated and sanitized with **Zod**
- Rate limiting on all API routes, with stricter limits on auth endpoints

---

## 📦 Key Dependencies

```json
{
  "dependencies": {
    "@prisma/adapter-mariadb": "latest",
    "@prisma/client": "^7.x",
    "bcryptjs": "^2.x",
    "dotenv": "^16.x",
    "express": "^4.x",
    "express-rate-limit": "^7.x",
    "jsonwebtoken": "^9.x",
    "mariadb": "latest",
    "prisma": "^7.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "cross-env": "^7.x",
    "jest": "^29.x",
    "nodemon": "^3.x",
    "supertest": "^7.x"
  }
}
```

---

## 🗺️ What's Next

- [x] API versioning (`/api/v1/`)
- [x] Pagination for task listing
- [x] Unit & integration tests (Jest + Supertest)
- [x] Rate limiting
- [ ] Task filtering and sorting
- [ ] Refresh tokens

---

## 👨‍💻 Author

**Tosin Alabi**  
GitHub: [@alatos2](https://github.com/alatos2)  
Learning Node.js backend development — building professional APIs from scratch.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).