# 🚀 Distributed Job Scheduler

A production-inspired distributed task scheduling platform built using **Node.js, TypeScript, Express.js, React, PostgreSQL, Redis, BullMQ, and Prisma ORM**.

This project demonstrates the design and implementation of a scalable job scheduling system with authentication, organization-based resource management, distributed workers, job execution tracking, and real-time monitoring.

> **Project Status:** Phase 1–7 Completed | Phase 8 Partially Implemented

---

# 📌 Table of Contents

- Overview
- Features
- Tech Stack
- Monorepo Structure
- Project Modules
- Getting Started
- Environment Variables
- Running the Project
- Build
- Current Progress
- Future Improvements
- Author

---

# 📖 Overview

The Distributed Job Scheduler is designed to manage asynchronous background jobs in a scalable and organized manner.

It provides:

- Secure Authentication & Authorization
- Organization-based Multi-Tenancy
- Project & Queue Management
- Distributed Worker Execution
- Job Scheduling
- Execution Tracking
- Dead Letter Queue (DLQ) Management
- Real-time Monitoring using Socket.IO

The project follows **Clean Architecture** principles and is organized as a **TypeScript Monorepo**.

---

# ✨ Features

## Authentication

- JWT Authentication
- Refresh Token Rotation
- Secure Password Hashing (bcrypt)
- Protected APIs
- Role-Based Access Control (RBAC)

---

## Organization Management

- Create Organizations
- Update Organizations
- Delete Organizations
- Organization Membership
- OWNER / ADMIN / MEMBER Roles

---

## Project Management

- Create Projects
- Update Projects
- Delete Projects
- Organization Scoped Projects

---

## Queue Management

- Queue CRUD Operations
- Pause / Resume Queue
- Queue Priority
- Queue Concurrency
- Retry Policy Configuration

---

## Job Management

Supports multiple job types:

- Immediate Jobs
- Delayed Jobs
- Scheduled Jobs
- Batch Jobs

Additional Features:

- Job Status Tracking
- Job Metadata
- Job Priority
- Payload Storage
- Execution History

---

## Worker Service

- Distributed BullMQ Workers
- Worker Registration
- Worker Heartbeats
- Job Execution
- Job Logging
- Graceful Shutdown

---

## Dead Letter Queue (DLQ)

- View Failed Jobs
- Requeue Failed Jobs
- Delete DLQ Entries

---

## Real-Time Updates

Using Socket.IO:

- Worker Status Updates
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

# 📁 Monorepo Structure

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

## Folder Responsibilities

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

### apps/worker

Background worker responsible for:

- Processing BullMQ Jobs
- Updating Job Status
- Writing Execution Logs
- Worker Heartbeats

### apps/web

React Dashboard providing:

- Queue Monitoring
- Job Monitoring
- Worker Status
- Real-time Updates

### packages/database

Shared database package containing:

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

## Installation

Clone the repository

```bash
git clone https://github.com/Varripoornachandrarao/JOBSCHEDULER.git

cd JOBSCHEDULER
```

Install dependencies

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

Run database migrations

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

## API

```bash
npm run dev:api
```

Default:

```
http://localhost:3001
```

---

## Worker

```bash
npm run dev:worker
```

---

## Frontend

```bash
npm run dev:web
```

Default:

```
http://localhost:3000
```

---

# 🏗 Build

Build all workspaces

```bash
npm run build
```

---

# 📈 Current Progress

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
- Distributed Worker Auto Scaling
- Monitoring & Alerting
- Metrics Dashboard

---

# 🤝 Contributing

Contributions, suggestions, and feedback are welcome.

Feel free to fork the repository and create a pull request.

---

# 👨‍💻 Author

**Poorna Chandra Rao Varri**

SRM Institute of Science and Technology

GitHub:

https://github.com/Varripoornachandrarao

---

# ⭐ Acknowledgements

This project was developed as part of a backend engineering recruitment assignment to demonstrate scalable distributed system design, clean architecture principles, and modern TypeScript development practices.
*(Runs by default at http://localhost:3000)*
