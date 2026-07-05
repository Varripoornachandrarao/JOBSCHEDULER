# 🚀 Distributed Job Scheduler

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-Backend-000000?logo=express)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-BullMQ-DC382D?logo=redis&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![License](https://img.shields.io/badge/License-MIT-brightgreen)

A **production-inspired distributed task scheduling platform** built using **Node.js, TypeScript, Express.js, React, PostgreSQL, Redis, BullMQ, Prisma ORM, and Socket.IO**.

The project demonstrates the design and implementation of a scalable distributed job scheduling system supporting authentication, organization management, queue management, worker execution, job lifecycle tracking, and real-time monitoring.

---

# 📌 Assignment Status

This repository was developed as part of a **Backend Engineering Recruitment Assignment**.

### Current Progress

| Module | Status |
|---------|--------|
| Authentication & Authorization | ✅ Completed |
| Organization Management | ✅ Completed |
| Project Management | ✅ Completed |
| Queue Management | ✅ Completed |
| Job Management | ✅ Completed |
| Worker Service | ✅ Completed |
| Dead Letter Queue (DLQ) API | ✅ Completed |
| Worker Retry Engine | ⚠️ Partially Implemented |

> **Note:** The repository reflects the current implementation progress submitted for the assignment.

---

# 📖 Overview

The Distributed Job Scheduler enables applications to process background tasks asynchronously through distributed workers.

It supports:

- Secure Authentication & Authorization
- Multi-Tenant Organization Management
- Project Management
- Queue Management
- Job Scheduling
- Distributed Worker Processing
- Execution History
- Dead Letter Queue (DLQ)
- Real-time Monitoring using Socket.IO

The project follows **Clean Architecture** and is organized as a **TypeScript Monorepo**.

---

# ✨ Features

## 🔐 Authentication

- JWT Authentication
- Refresh Token Rotation
- Password Hashing (bcrypt)
- Protected APIs
- Role-Based Access Control (RBAC)

---

## 🏢 Organization Management

- Create Organization
- Update Organization
- Delete Organization
- Organization Membership
- OWNER / ADMIN / MEMBER Roles

---

## 📁 Project Management

- Create Projects
- Update Projects
- Delete Projects
- Organization Scoped Projects

---

## 📦 Queue Management

- Queue CRUD Operations
- Pause / Resume Queue
- Queue Priority
- Queue Concurrency
- Retry Policy Configuration

---

## ⚙️ Job Management

Supports:

- Immediate Jobs
- Delayed Jobs
- Scheduled Jobs
- Batch Jobs

Additional Features:

- Job Status Tracking
- Priority
- Metadata
- Payload Storage
- Execution History

---

## 👷 Worker Service

- Distributed BullMQ Workers
- Worker Registration
- Worker Heartbeats
- Job Execution
- Execution Logs
- Graceful Shutdown

---

## 📥 Dead Letter Queue (DLQ)

- View Failed Jobs
- Requeue Failed Jobs
- Delete DLQ Entries

---

## 📡 Real-Time Updates

Powered by Socket.IO

- Worker Status
- Job Lifecycle Events
- Heartbeats
- Execution Notifications

---

# 🛠 Tech Stack

## Backend

- Node.js
- TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- Redis
- BullMQ
- Socket.IO

## Frontend

- React
- Vite
- Tailwind CSS

## Infrastructure

- Docker
- Docker Compose

---

# 📂 Monorepo Structure

```text
.
├── apps
│   ├── api
│   ├── worker
│   └── web
│
├── packages
│   └── database
│
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

---

# 📁 Folder Responsibilities

### apps/api

REST API Gateway responsible for:

- Authentication
- Organizations
- Projects
- Queues
- Jobs
- Workers
- Dead Letter Queue APIs
- Socket.IO Server

---

### apps/worker

Background Worker responsible for:

- Processing BullMQ Jobs
- Worker Heartbeats
- Updating Job Status
- Writing Execution Logs

---

### apps/web

Dashboard providing:

- Queue Monitoring
- Worker Monitoring
- Job Monitoring
- Real-time Updates

---

### packages/database

Shared Prisma package containing:

- Prisma Schema
- Prisma Client
- Database Utilities

---

# 🚀 Getting Started

## Prerequisites

- Node.js 20+
- PostgreSQL
- Redis
- Docker (Optional)

---

## Clone Repository

```bash
git clone https://github.com/Varripoornachandrarao/JOBSCHEDULER.git

cd JOBSCHEDULER
```

---

## Install Dependencies

```bash
npm install
```

---

## Environment Variables

Create a `.env` file at the project root.

Example:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/job_scheduler

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_ACCESS_SECRET=your_access_secret

JWT_REFRESH_SECRET=your_refresh_secret
```

---

## Database

Generate Prisma Client

```bash
npm run db:generate
```

Run Database Migrations

```bash
npm run db:migrate
```

---

# 🐳 Docker

Start PostgreSQL and Redis

```bash
docker-compose up -d
```

---

# ▶ Running the Project

## API Gateway

```bash
npm run dev:api
```

Runs at:

```
http://localhost:3001
```

---

## Worker Service

```bash
npm run dev:worker
```

---

## Frontend

```bash
npm run dev:web
```

Runs at:

```
http://localhost:3000
```

---

# 🏗 Build

Build the complete workspace

```bash
npm run build
```

---

# 📊 Current Progress

| Module | Status |
|---------|--------|
| Authentication | ✅ |
| Organization Management | ✅ |
| Project Management | ✅ |
| Queue Management | ✅ |
| Job Management | ✅ |
| Worker Service | ✅ |
| Dead Letter Queue API | ✅ |
| Retry Engine | ⚠️ Partial |

---

# 🔮 Future Improvements

Planned enhancements include:

- Complete Worker Retry Scheduler
- Advanced Retry Strategies
- Automatic Dead Letter Queue Processing
- Workflow Dependencies
- Queue Analytics Dashboard
- Worker Auto Scaling
- Monitoring & Alerting
- Performance Metrics Dashboard

---

# 🤝 Contributing

Contributions, suggestions, and feedback are welcome.

Feel free to fork this repository and submit a pull request.

---

# 👨‍💻 Author

**Poorna Chandra Rao Varri**

B.Tech Computer Science and Engineering

SRM Institute of Science and Technology

GitHub Profile:

https://github.com/Varripoornachandrarao

Project Repository:

https://github.com/Varripoornachandrarao/JOBSCHEDULER

---

# 📄 License

This project is released under the **MIT License**.

---

# ⭐ Acknowledgements

This project was developed as part of a **Backend Engineering Recruitment Assignment** to demonstrate distributed systems design, scalable backend development, clean architecture principles, and modern TypeScript application development.
