# Stage 1: Dependencies and Build
FROM node:18-alpine AS builder

# Install necessary build dependencies for Prisma
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy remaining source code
COPY . .

# Stage 2: Production
FROM node:18-alpine

# Install production dependencies
RUN apk add --no-cache openssl

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy Prisma
COPY prisma ./prisma/

# Copy built Prisma client and other files from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy application code
COPY --chown=appuser:appgroup . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Switch to non-root user
USER appuser

EXPOSE 4000

# Start the application
CMD ["node", "build/index.js"] 