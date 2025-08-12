# Multi-stage build for Node.js telemetry ingestor
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runtime

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S ingestor -u 1001

WORKDIR /app

# Copy dependencies and source
COPY --from=builder --chown=ingestor:nodejs /app/node_modules ./node_modules
COPY --chown=ingestor:nodejs package.json ./
COPY --chown=ingestor:nodejs src/ ./src/

USER ingestor

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('ok')" || exit 1

EXPOSE 3000

# Default to reading from stdin, but can be overridden
CMD ["node", "src/index.js"]
