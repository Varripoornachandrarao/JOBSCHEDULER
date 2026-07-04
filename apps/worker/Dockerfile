FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY packages/database/package*.json ./packages/database/
COPY apps/worker/package*.json ./apps/worker/

RUN npm ci

COPY packages/database/ ./packages/database/
COPY apps/worker/ ./apps/worker/

RUN npm run generate -w packages/database
RUN npm run build -w packages/database
RUN npm run build -w apps/worker

FROM node:20-alpine AS runner

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY packages/database/package*.json ./packages/database/
COPY apps/worker/package*.json ./apps/worker/

RUN npm ci --only=production

COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/node_modules/@prisma/client ./packages/database/node_modules/@prisma/client
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist

CMD ["node", "apps/worker/dist/index.js"]
