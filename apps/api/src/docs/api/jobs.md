# Job Management API

## Base URL
`/api`

## Auth
All endpoints require a valid Bearer token.

---

### POST `/queues/:queueId/jobs`
Create a job in a queue.

**Request body (example - delayed job)**
```json
{
  "name": "example-job",
  "payload": {"foo": "bar"},
  "priority": 1,
  "delay": 5000,
  "retryPolicy": {
    "name": "default",
    "strategy": "EXPONENTIAL",
    "maxAttempts": 3,
    "initialDelayMs": 1000,
    "maxDelayMs": 10000,
    "backoffMultiplier": 2.0,
    "jitter": true
  },
  "metadata": {"source": "postman"}
}
```

**Responses**
- `201` `{ "job": { ... } }`
- `400` validation error
- `401` missing/invalid token
- `403` forbidden (ADMIN/OWNER required)
- `404` queue not found

---

### GET `/queues/:queueId/jobs`
List jobs in a queue.

**Responses**
- `200` `{ "jobs": [ ... ] }`
- `403` forbidden

---

### GET `/jobs/:jobId`
Get a job by id.

**Responses**
- `200` `{ "job": { ... } }`
- `404` job not found
- `403` forbidden

---

### PUT `/jobs/:jobId`
Update job configuration.

**Request body (example)**
```json
{ "priority": 10, "payload": {"updated": true}, "metadata": {"tag": "v2"} }
```

**Responses**
- `200` `{ "job": { ... } }`
- `409` invalid status transition

---

### DELETE `/jobs/:jobId`
Delete a job.

**Responses**
- `200` `{ "message": "Job deleted successfully" }`
- `409` cannot delete in current state

---

### POST `/jobs/:jobId/cancel`
Cancel a job.

**Responses**
- `200` `{ "job": { ... } }`
- `409` invalid status transition

---

### POST `/jobs/:jobId/retry`
Retry a job.

**Request body (optional)**
```json
{ "attemptCount": 1 }
```

**Responses**
- `200` `{ "job": { ... } }`
- `409` invalid status transition

