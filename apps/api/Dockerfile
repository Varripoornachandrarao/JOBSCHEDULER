FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY packages/database/package*.json ./packages/database/
COPY apps/api/package*.json ./apps/api/

RUN npm ci

COPY packages/database/ ./packages/database/
COPY apps/api/ ./apps/api/

RUN npm run generate -w packages/database
RUN npm run build -w packages/database
RUN npm run build -w apps/api

FROM node:20-alpine AS runner

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY packages/database/package*.json ./packages/database/
COPY apps/api/package*.json ./apps/api/

RUN npm ci --only=production

COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/node_modules/@prisma/client ./packages/database/node_modules/@prisma/client
COPY --from=builder /app/apps/api/dist ./apps/api/dist

EXPOSE 3001

CMD ["node", "apps/api/dist/index.js"]
