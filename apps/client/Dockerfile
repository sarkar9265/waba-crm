FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace configuration
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/ ./packages/
COPY apps/client/ ./apps/client/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the Client
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter client run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3002
EXPOSE 3002

# Copy necessary files for Next.js standalone output
COPY --from=builder /app/apps/client/public ./apps/client/public
COPY --from=builder /app/apps/client/.next/standalone ./
COPY --from=builder /app/apps/client/.next/static ./apps/client/.next/static

# Start Next.js standalone server
# Next.js standalone server uses server.js
CMD ["node", "apps/client/server.js"]
