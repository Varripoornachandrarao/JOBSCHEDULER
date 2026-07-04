# TODO
- [ ] Verify repo state (git status/branch/remote)
- [x] Stage changed + new files
- [x] Stage/commit after Phase 6
- [ ] Create Phase 6 Job Management module (apps/api/src/jobs/*)

- [ ] Wire job routes into apps/api/src/app.ts
- [ ] Add Postman collection for Job endpoints
- [ ] Add API documentation for Job endpoints
- [ ] Run npm run build
- [ ] Verify Job endpoints (CRUD + cancel + retry)
- [ ] Verify authorization roles (OWNER/ADMIN/MEMBER/non-member)
- [ ] Verify job status transitions
- [ ] Self-review + fix issues

- [ ] Phase 7: Worker Service
  - [ ] Create worker architecture (services/repositories/worker) under apps/worker/src
  - [ ] Implement Worker registration & heartbeat + graceful shutdown
  - [ ] Implement BullMQ Worker + queue subscription
  - [ ] Implement atomic job claiming + JobExecution + JobLog
  - [ ] Implement generic job processor (no hardcoded job names)
  - [ ] Implement Socket.IO notifications
  - [ ] Run npm run build and verify worker registration/heartbeat/execution

