# Database Design

## Overview

The Phase 2 schema models a multi-tenant distributed job scheduler with Prisma and PostgreSQL. Every entity uses a UUID primary key, explicit foreign keys, `createdAt`, and `updatedAt`. Operational state is represented with enums for member roles, job lifecycle, queue lifecycle, worker lifecycle, retry strategy, and job type.

The schema is normalized around ownership and runtime boundaries:

- `User`, `Organization`, and `OrganizationMember` support authentication users and multi-tenant membership.
- `Project` scopes queues, workers, retry policies, jobs, and schedules inside an organization.
- `Queue` stores queue-level scheduling configuration: status, priority, concurrency, rate limits, retention, and default retry policy.
- `RetryPolicy` stores reusable retry behavior per project instead of duplicating retry settings on every queue or job.
- `Job` stores executable work items for immediate, delayed, scheduled, recurring, and batch jobs.
- `ScheduledJob` stores recurring or future schedule definitions that generate `Job` records.
- `Worker`, `WorkerHeartbeat`, `JobExecution`, `JobLog`, and `DeadLetterQueue` record distributed execution, observability, and failure history.

## Relationships

- A `User` can join many organizations through `OrganizationMember`.
- An `Organization` owns many `Project` records.
- A `Project` owns many `Queue`, `RetryPolicy`, `Job`, `Worker`, and `ScheduledJob` records.
- A `Queue` belongs to one project and receives many jobs. It can reference one default retry policy.
- A `RetryPolicy` belongs to one project and can be applied to many queues and jobs.
- A `Job` belongs to one project and one queue. It can optionally reference a retry policy, scheduled job, parent batch job, and assigned worker.
- Batch jobs are represented with the self-relation `Job.parentJobId` plus `batchKey`.
- A `ScheduledJob` belongs to one project and queue and can create many concrete `Job` records.
- A `Worker` belongs to one project and can optionally be bound to one queue.
- A `WorkerHeartbeat` belongs to one worker and stores time-series worker health data.
- A `JobExecution` belongs to one job and optionally one worker, preserving attempt history.
- A `JobLog` belongs to one job and optionally one execution, allowing both job-level and attempt-level logs.
- A `DeadLetterQueue` entry belongs to one job and queue, preserving terminal failure details.

## Indexes

The schema indexes common scheduler and dashboard access paths:

- Tenant lookups: `Organization.slug`, `Project.organizationId`, `Project.slug`, and membership user/organization indexes.
- Queue discovery: `Queue.projectId`, `Queue.status`, `Queue.priority`, and the compound `Queue.projectId/status/priority`.
- Dispatch scans: `Job.queueId/status/runAt/priority` for workers polling runnable jobs.
- Job dashboards: `Job.projectId/type/status`, plus single-column indexes on `status`, `type`, `runAt`, `priority`, and `batchKey`.
- Retry and schedule joins: `Job.retryPolicyId`, `Job.scheduledJobId`, and `ScheduledJob.projectId/isActive/nextRunAt`.
- Worker monitoring: `Worker.projectId/status`, `Worker.lastHeartbeatAt`, and `WorkerHeartbeat.workerId/createdAt`.
- Execution history: `JobExecution.jobId`, `JobExecution.workerId`, `JobExecution.status`, and unique `JobExecution.jobId/attempt`.
- Logs: `JobLog.jobId/createdAt`, `JobLog.executionId`, and `JobLog.level`.
- DLQ triage: `DeadLetterQueue.queueId/failedAt`, `DeadLetterQueue.jobId`, and `DeadLetterQueue.failedAt`.

## Assignment Coverage

- Authentication users: `User`
- Organizations and members: `Organization`, `OrganizationMember`, `MemberRole`
- Multiple projects: `Project`
- Multiple queues per project: `Queue`
- Queue configuration, priority, and concurrency: `Queue.status`, `priority`, `concurrency`, rate-limit, and retention fields
- Retry policies: `RetryPolicy`, `RetryStrategy`
- Immediate jobs: `Job.type = IMMEDIATE`
- Delayed jobs: `Job.type = DELAYED`, `Job.runAt`
- Scheduled jobs: `ScheduledJob`, `Job.type = SCHEDULED`
- Cron jobs: `ScheduledJob.cronExpression`, `Job.type = RECURRING`
- Batch jobs: `Job.type = BATCH`, `Job.parentJobId`, `Job.batchKey`
- Worker assignment: `Job.assignedWorkerId`, `Worker`
- Worker heartbeat: `WorkerHeartbeat`, `Worker.lastHeartbeatAt`
- Job execution history: `JobExecution`
- Job logs: `JobLog`
- Dead Letter Queue: `DeadLetterQueue`
