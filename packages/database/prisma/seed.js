const {
  PrismaClient,
  JobLogLevel,
  JobStatus,
  JobType,
  MemberRole,
  QueueStatus,
  RetryStrategy,
  WorkerStatus,
} = require('@prisma/client');

const prisma = new PrismaClient();

const ids = {
  owner: '11111111-1111-4111-8111-111111111111',
  operator: '22222222-2222-4222-8222-222222222222',
  organization: '33333333-3333-4333-8333-333333333333',
  memberOwner: '44444444-4444-4444-8444-444444444444',
  memberOperator: '55555555-5555-4555-8555-555555555555',
  project: '66666666-6666-4666-8666-666666666666',
  retryEmail: '77777777-7777-4777-8777-777777777777',
  retryVideo: '88888888-8888-4888-8888-888888888888',
  queueEmail: '99999999-9999-4999-8999-999999999999',
  queueVideo: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  dailyDigest: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  weeklyBilling: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  workerEmail: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  workerVideo: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  jobImmediate: '10101010-1010-4010-8010-101010101010',
  jobDelayed: '20202020-2020-4020-8020-202020202020',
  jobRecurring: '30303030-3030-4030-8030-303030303030',
  jobBatchParent: '40404040-4040-4040-8040-404040404040',
  jobBatchChild: '50505050-5050-4050-8050-505050505050',
  jobFailed: '60606060-6060-4060-8060-606060606060',
};

async function main() {
  const now = new Date();
  const inTenMinutes = new Date(now.getTime() + 10 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  await prisma.user.upsert({
    where: { id: ids.owner },
    update: {},
    create: {
      id: ids.owner,
      email: 'owner@acme.jobs',
      passwordHash: '$2b$12$demoOwnerPasswordHash',
      firstName: 'Asha',
      lastName: 'Raman',
      lastLoginAt: now,
    },
  });

  await prisma.user.upsert({
    where: { id: ids.operator },
    update: {},
    create: {
      id: ids.operator,
      email: 'operator@acme.jobs',
      passwordHash: '$2b$12$demoOperatorPasswordHash',
      firstName: 'Nikhil',
      lastName: 'Menon',
      lastLoginAt: now,
    },
  });

  await prisma.organization.upsert({
    where: { id: ids.organization },
    update: {},
    create: {
      id: ids.organization,
      name: 'Acme Automation',
      slug: 'acme-automation',
    },
  });

  await prisma.organizationMember.upsert({
    where: { id: ids.memberOwner },
    update: {},
    create: {
      id: ids.memberOwner,
      organizationId: ids.organization,
      userId: ids.owner,
      role: MemberRole.OWNER,
      joinedAt: now,
    },
  });

  await prisma.organizationMember.upsert({
    where: { id: ids.memberOperator },
    update: {},
    create: {
      id: ids.memberOperator,
      organizationId: ids.organization,
      userId: ids.operator,
      role: MemberRole.ADMIN,
      joinedAt: now,
    },
  });

  await prisma.project.upsert({
    where: { id: ids.project },
    update: {},
    create: {
      id: ids.project,
      organizationId: ids.organization,
      name: 'Production Scheduler',
      slug: 'production-scheduler',
      description: 'Demo project for email, billing, and video processing jobs.',
    },
  });

  await prisma.retryPolicy.upsert({
    where: { id: ids.retryEmail },
    update: {},
    create: {
      id: ids.retryEmail,
      projectId: ids.project,
      name: 'Email exponential retry',
      description: 'Fast retries for transient email provider failures.',
      strategy: RetryStrategy.EXPONENTIAL,
      maxAttempts: 5,
      initialDelayMs: 1000,
      maxDelayMs: 60000,
      backoffMultiplier: 2,
      jitter: true,
    },
  });

  await prisma.retryPolicy.upsert({
    where: { id: ids.retryVideo },
    update: {},
    create: {
      id: ids.retryVideo,
      projectId: ids.project,
      name: 'Video fixed retry',
      description: 'Slower fixed retries for expensive render tasks.',
      strategy: RetryStrategy.FIXED,
      maxAttempts: 3,
      initialDelayMs: 30000,
      maxDelayMs: 30000,
      backoffMultiplier: 1,
      jitter: false,
    },
  });

  await prisma.queue.upsert({
    where: { id: ids.queueEmail },
    update: {},
    create: {
      id: ids.queueEmail,
      projectId: ids.project,
      defaultRetryPolicyId: ids.retryEmail,
      name: 'email-critical',
      description: 'High-priority outbound transactional email queue.',
      status: QueueStatus.ACTIVE,
      priority: 100,
      concurrency: 25,
      rateLimitMax: 500,
      rateLimitWindowMs: 60000,
      retentionDays: 14,
    },
  });

  await prisma.queue.upsert({
    where: { id: ids.queueVideo },
    update: {},
    create: {
      id: ids.queueVideo,
      projectId: ids.project,
      defaultRetryPolicyId: ids.retryVideo,
      name: 'video-rendering',
      description: 'CPU-heavy rendering jobs with lower concurrency.',
      status: QueueStatus.ACTIVE,
      priority: 20,
      concurrency: 4,
      rateLimitMax: 40,
      rateLimitWindowMs: 60000,
      retentionDays: 30,
    },
  });

  await prisma.scheduledJob.upsert({
    where: { id: ids.dailyDigest },
    update: {},
    create: {
      id: ids.dailyDigest,
      projectId: ids.project,
      queueId: ids.queueEmail,
      name: 'daily-user-digest',
      description: 'Recurring digest email fan-out.',
      type: JobType.RECURRING,
      cronExpression: '0 8 * * *',
      payload: { template: 'daily-digest', segment: 'active-users' },
      priority: 50,
      timezone: 'Asia/Kolkata',
      nextRunAt: tomorrow,
    },
  });

  await prisma.scheduledJob.upsert({
    where: { id: ids.weeklyBilling },
    update: {},
    create: {
      id: ids.weeklyBilling,
      projectId: ids.project,
      queueId: ids.queueEmail,
      name: 'weekly-billing-summary',
      description: 'Scheduled weekly billing notification.',
      type: JobType.SCHEDULED,
      payload: { template: 'billing-summary', plan: 'enterprise' },
      priority: 40,
      timezone: 'UTC',
      nextRunAt: nextWeek,
    },
  });

  await prisma.worker.upsert({
    where: { id: ids.workerEmail },
    update: {},
    create: {
      id: ids.workerEmail,
      projectId: ids.project,
      queueId: ids.queueEmail,
      name: 'email-worker-01',
      hostname: 'scheduler-email-01',
      ipAddress: '10.0.10.21',
      status: WorkerStatus.ACTIVE,
      concurrencyLimit: 25,
      lastHeartbeatAt: now,
    },
  });

  await prisma.worker.upsert({
    where: { id: ids.workerVideo },
    update: {},
    create: {
      id: ids.workerVideo,
      projectId: ids.project,
      queueId: ids.queueVideo,
      name: 'video-worker-01',
      hostname: 'scheduler-video-01',
      ipAddress: '10.0.20.14',
      status: WorkerStatus.IDLE,
      concurrencyLimit: 4,
      lastHeartbeatAt: now,
    },
  });

  await prisma.workerHeartbeat.upsert({
    where: { id: 'abababab-abab-4aba-8aba-abababababab' },
    update: {},
    create: {
      id: 'abababab-abab-4aba-8aba-abababababab',
      workerId: ids.workerEmail,
      status: WorkerStatus.ACTIVE,
      cpuUsagePercent: 42.5,
      memoryUsageBytes: BigInt(734003200),
      activeJobsCount: 7,
    },
  });

  await prisma.workerHeartbeat.upsert({
    where: { id: 'bcbcbcbc-bcbc-4bcb-8bcb-bcbcbcbcbcbc' },
    update: {},
    create: {
      id: 'bcbcbcbc-bcbc-4bcb-8bcb-bcbcbcbcbcbc',
      workerId: ids.workerVideo,
      status: WorkerStatus.IDLE,
      cpuUsagePercent: 18.2,
      memoryUsageBytes: BigInt(1140850688),
      activeJobsCount: 0,
    },
  });

  await prisma.job.upsert({
    where: { id: ids.jobImmediate },
    update: {},
    create: {
      id: ids.jobImmediate,
      projectId: ids.project,
      queueId: ids.queueEmail,
      retryPolicyId: ids.retryEmail,
      assignedWorkerId: ids.workerEmail,
      type: JobType.IMMEDIATE,
      name: 'email.send.password-reset',
      payload: { userId: 'usr_1001', template: 'password-reset' },
      status: JobStatus.SUCCEEDED,
      priority: 100,
      attemptCount: 1,
      runAt: now,
      startedAt: now,
      finishedAt: now,
    },
  });

  await prisma.job.upsert({
    where: { id: ids.jobDelayed },
    update: {},
    create: {
      id: ids.jobDelayed,
      projectId: ids.project,
      queueId: ids.queueEmail,
      retryPolicyId: ids.retryEmail,
      type: JobType.DELAYED,
      name: 'email.send.trial-ending',
      payload: { accountId: 'acct_2002', template: 'trial-ending' },
      status: JobStatus.DELAYED,
      priority: 30,
      runAt: inTenMinutes,
    },
  });

  await prisma.job.upsert({
    where: { id: ids.jobRecurring },
    update: {},
    create: {
      id: ids.jobRecurring,
      projectId: ids.project,
      queueId: ids.queueEmail,
      retryPolicyId: ids.retryEmail,
      scheduledJobId: ids.dailyDigest,
      type: JobType.RECURRING,
      name: 'daily-user-digest.run',
      payload: { template: 'daily-digest', segment: 'active-users', runDate: now.toISOString().slice(0, 10) },
      status: JobStatus.QUEUED,
      priority: 50,
      runAt: now,
    },
  });

  await prisma.job.upsert({
    where: { id: ids.jobBatchParent },
    update: {},
    create: {
      id: ids.jobBatchParent,
      projectId: ids.project,
      queueId: ids.queueVideo,
      retryPolicyId: ids.retryVideo,
      type: JobType.BATCH,
      name: 'video.render.batch',
      payload: { batchId: 'batch_3003', assetCount: 12 },
      status: JobStatus.RUNNING,
      priority: 20,
      batchKey: 'batch_3003',
      runAt: now,
      startedAt: now,
    },
  });

  await prisma.job.upsert({
    where: { id: ids.jobBatchChild },
    update: {},
    create: {
      id: ids.jobBatchChild,
      projectId: ids.project,
      queueId: ids.queueVideo,
      retryPolicyId: ids.retryVideo,
      parentJobId: ids.jobBatchParent,
      assignedWorkerId: ids.workerVideo,
      type: JobType.BATCH,
      name: 'video.render.asset',
      payload: { batchId: 'batch_3003', assetId: 'asset_7', preset: '1080p' },
      status: JobStatus.RUNNING,
      priority: 20,
      attemptCount: 1,
      batchKey: 'batch_3003',
      runAt: now,
      lockedAt: now,
      startedAt: now,
    },
  });

  await prisma.job.upsert({
    where: { id: ids.jobFailed },
    update: {},
    create: {
      id: ids.jobFailed,
      projectId: ids.project,
      queueId: ids.queueEmail,
      retryPolicyId: ids.retryEmail,
      type: JobType.IMMEDIATE,
      name: 'email.send.invoice',
      payload: { invoiceId: 'inv_4004', template: 'invoice-ready' },
      status: JobStatus.DEAD_LETTERED,
      priority: 80,
      maxAttempts: 5,
      attemptCount: 5,
      runAt: now,
      startedAt: now,
      finishedAt: now,
      lastError: 'Email provider rejected recipient after all retry attempts.',
    },
  });

  await prisma.jobExecution.upsert({
    where: { jobId_attempt: { jobId: ids.jobImmediate, attempt: 1 } },
    update: {},
    create: {
      id: 'cdcdcdcd-cdcd-4cdc-8cdc-cdcdcdcdcdcd',
      jobId: ids.jobImmediate,
      workerId: ids.workerEmail,
      attempt: 1,
      status: JobStatus.SUCCEEDED,
      startedAt: now,
      finishedAt: now,
      durationMs: 183,
    },
  });

  await prisma.jobExecution.upsert({
    where: { jobId_attempt: { jobId: ids.jobBatchChild, attempt: 1 } },
    update: {},
    create: {
      id: 'dededede-dede-4ded-8ded-dededededede',
      jobId: ids.jobBatchChild,
      workerId: ids.workerVideo,
      attempt: 1,
      status: JobStatus.RUNNING,
      startedAt: now,
    },
  });

  await prisma.jobExecution.upsert({
    where: { jobId_attempt: { jobId: ids.jobFailed, attempt: 5 } },
    update: {},
    create: {
      id: 'efefefef-efef-4efe-8efe-efefefefefef',
      jobId: ids.jobFailed,
      workerId: ids.workerEmail,
      attempt: 5,
      status: JobStatus.FAILED,
      startedAt: now,
      finishedAt: now,
      durationMs: 226,
      errorMessage: 'Recipient address permanently rejected.',
      stackTrace: 'ProviderError: Recipient address permanently rejected.',
    },
  });

  await prisma.jobLog.upsert({
    where: { id: '12121212-1212-4121-8121-121212121212' },
    update: {},
    create: {
      id: '12121212-1212-4121-8121-121212121212',
      jobId: ids.jobImmediate,
      executionId: 'cdcdcdcd-cdcd-4cdc-8cdc-cdcdcdcdcdcd',
      level: JobLogLevel.INFO,
      message: 'Password reset email sent successfully.',
      metadata: { provider: 'demo-mail', latencyMs: 183 },
    },
  });

  await prisma.jobLog.upsert({
    where: { id: '23232323-2323-4232-8232-232323232323' },
    update: {},
    create: {
      id: '23232323-2323-4232-8232-232323232323',
      jobId: ids.jobBatchChild,
      executionId: 'dededede-dede-4ded-8ded-dededededede',
      level: JobLogLevel.INFO,
      message: 'Rendering asset asset_7 with preset 1080p.',
      metadata: { batchId: 'batch_3003', assetId: 'asset_7' },
    },
  });

  await prisma.jobLog.upsert({
    where: { id: '34343434-3434-4343-8343-343434343434' },
    update: {},
    create: {
      id: '34343434-3434-4343-8343-343434343434',
      jobId: ids.jobFailed,
      executionId: 'efefefef-efef-4efe-8efe-efefefefefef',
      level: JobLogLevel.ERROR,
      message: 'Recipient address permanently rejected.',
      metadata: { providerCode: 'recipient_rejected' },
    },
  });

  await prisma.deadLetterQueue.upsert({
    where: { id: '45454545-4545-4454-8454-454545454545' },
    update: {},
    create: {
      id: '45454545-4545-4454-8454-454545454545',
      jobId: ids.jobFailed,
      queueId: ids.queueEmail,
      failedStatus: JobStatus.FAILED,
      reason: 'Exceeded retry policy maxAttempts.',
      errorMessage: 'Recipient address permanently rejected.',
      errorStack: 'ProviderError: Recipient address permanently rejected.',
      failedAt: now,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
