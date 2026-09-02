FROM node:22-alpine AS builder
WORKDIR /app

# Install build tools for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Ensure optional directories exist so COPY doesn't fail
RUN mkdir -p public data

# Production image
FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache python3 make g++ && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public/
COPY --from=builder /app/data ./data/

USER nextjs

CMD ["sh", "-c", "node server.js"]
