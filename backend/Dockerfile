# Production Dockerfile for Nexus Backend (Single Service: Express + Hocuspocus)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions and Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy rest of backend source code
COPY . .

# Generate Prisma Client and build TypeScript project
RUN npx prisma generate
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy generated Prisma client and built distribution files from builder
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Run Prisma database migrations and start single backend server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
