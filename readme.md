# Task Manager API

A professional RESTful API built with Node.js, Express, Prisma, and MySQL. This project covers user authentication with JWT, protected routes, CRUD operations, input validation, and global error handling.

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
| **dotenv** | Environment variables |
| **nodemon** | Auto-restart in development |

---

## 📁 Project Structure

```
task-manager/
├── prisma/
│   └── schema.prisma         # Database schema
├── src/
│   ├── config/
│   │   └── prisma.js         # Prisma client instance
│   ├── controllers/
│   │   ├── authController.js # Register & Login logic
│   │   └── taskController.js # CRUD task logic
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT protection
│   │   ├── validateMiddleware.js # Zod validation
│   │   └── errorMiddleware.js    # Global error handler
│   ├── routes/
│   │   ├── authRoutes.js     # Auth endpoints
│   │   └── taskRoutes.js     # Task endpoints
│   ├── validators/
│   │   ├── authValidator.js  # Register & Login schemas
│   │   └── taskValidator.js  # Create & Update schemas
│   └── app.js                # Express app entry point
├── prisma.config.ts           # Prisma 7 connection config
├── .env                       # Environment variables
├── .gitignore
└── package.json
```

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Laragon](https://laragon.org/) or any MySQL server
- [Postman](https://www.postman.com/) or Thunder Client for testing

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/task-manager-api.git
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

- Passwords are hashed using **bcryptjs** before storage
- On login, a JWT token is returned (expires in 7 days)
- Protected routes require the token in the `Authorization` header:

```
Authorization: Bearer <your_token_here>
```

---

## 📡 API Endpoints

### Auth Routes

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | ❌ |
| POST | `/api/auth/login` | Login and get JWT token | ❌ |

### Task Routes

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/tasks` | Create a new task | ✅ |
| GET | `/api/tasks` | Get all tasks for logged in user | ✅ |
| PUT | `/api/tasks/:id` | Update a task by ID | ✅ |
| DELETE | `/api/tasks/:id` | Delete a task by ID | ✅ |

---

## 📝 Request & Response Examples

### Register

**Request:**
```http
POST /api/auth/register
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
POST /api/auth/login
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
POST /api/tasks
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

### Get All Tasks

**Request:**
```http
GET /api/tasks
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
  ]
}
```

---

### Update Task

**Request:**
```http
PUT /api/tasks/1
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
DELETE /api/tasks/1
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

---

## 🚨 Error Responses

| Status Code | Meaning |
|---|---|
| `400` | Bad request / invalid input |
| `401` | Unauthorized / invalid token |
| `404` | Resource not found |
| `409` | Conflict / duplicate entry |
| `422` | Validation failed |
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

---

## 🔒 Security Features

- Passwords hashed with **bcryptjs** (salt rounds: 10)
- JWT tokens expire after **7 days**
- Passwords never returned in API responses
- Protected routes require valid JWT token
- Input validated and sanitized with **Zod**

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "@prisma/adapter-mariadb": "latest",
    "@prisma/client": "^7.x",
    "bcryptjs": "^2.x",
    "dotenv": "^16.x",
    "express": "^4.x",
    "jsonwebtoken": "^9.x",
    "mariadb": "latest",
    "prisma": "^7.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "nodemon": "^3.x"
  }
}
```

---

## 🗺️ What's Next

- [ ] API versioning (`/api/v1/`)
- [ ] Pagination for task listing
- [ ] Rate limiting
- [ ] Task filtering and sorting
- [ ] Refresh tokens
- [ ] Unit and integration tests

---

## 👨‍💻 Author

**Tosin Alabi**  
Learning Node.js backend development — building professional APIs from scratch.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).