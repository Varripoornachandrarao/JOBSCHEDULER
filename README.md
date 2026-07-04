# Distributed Job Scheduler (Monorepo)

A production-grade, distributed task processing engine built using Node.js, TypeScript, Express, React, PostgreSQL (Prisma ORM), and Redis (BullMQ). This workspace hosts the API Gateway, Worker daemon, and Dashboard frontend.

---

## 1. Folder Structure

```
/
├── apps/
│   ├── api/                   # Express HTTP API Gateway & Real-time WebSockets
│   ├── worker/                # TypeScript Task Execution Daemon
│   └── web/                   # Vite + React + TypeScript + Tailwind UI
├── packages/
│   └── database/              # Shared Prisma ORM client & schema
├── docker-compose.yml         # Dev cluster orchestrator (Postgres & Redis)
├── package.json               # Monorepo configuration mapping workspaces
└── tsconfig.json              # TypeScript compilation rules
```

### Folder Purposes
* **`apps/api`**: Exposes REST interfaces to control queues, schedule tasks (delayed, batch, or recurring), and streams real-time logs and worker metrics to connected clients using Socket.IO.
* **`apps/worker`**: Consumes jobs from Redis queues, updates task statuses, writes execution logs to PostgreSQL, and broadcasts telemetry heartbeats.
* **`apps/web`**: Dashboard to observe real-time worker states, monitor job metrics (success rates, latency, throughput), and pause or reconfigure queues.
* **`packages/database`**: Keeps database code DRY by housing the Prisma schema, generating the shared Prisma client, and managing db connection pooling.

---

## 2. Technical Stack Dependencies

### API Gateway (`apps/api`)
* `express` & `cors`: Web serving and middleware.
* `bullmq` & `ioredis`: BullMQ client instances communicating with Redis.
* `socket.io`: Bidirectional real-time log streaming.
* `@job-scheduler/database`: Local shared workspace library.

### Worker Daemon (`apps/worker`)
* `bullmq` & `ioredis`: Atomic queue claiming and scheduler hooks.
* `@job-scheduler/database`: Client mapping write targets for job statuses and logs.

### Frontend Dashboard (`apps/web`)
* `react` & `react-dom`: Declarative UI rendering.
* `tailwindcss`, `autoprefixer`, `postcss`: Layout design system.
* `vite`: High-performance development bundler.

---

## 3. Getting Started: Command Guides

### Step 1: Install Workspace Dependencies
Execute this command at the root directory to install all packages across every workspace package:
```bash
npm install
```

### Step 2: Start Infrastructure (Docker Compose)
Launch PostgreSQL and Redis in detached mode:
```bash
docker-compose up -d
```

### Step 3: Run Database Migrations & Code Generation
Generate the Prisma Client library:
```bash
npm run db:generate
```

### Step 4: Boot Applications (Local Development)

To start the projects, run the designated script for each service:

#### Start API Gateway
```bash
npm run dev:api
```
*(Runs by default at http://localhost:3001)*

#### Start Worker Service
```bash
npm run dev:worker
```

#### Start Frontend Web Client
```bash
npm run dev:web
```
*(Runs by default at http://localhost:3000)*
