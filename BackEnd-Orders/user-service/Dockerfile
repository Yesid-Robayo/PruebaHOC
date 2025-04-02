# Build Stage
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl3

WORKDIR /app

# Install dependencies
COPY package*.json ./ 
RUN npm ci

# Copy source code
COPY . . 

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production Stage
FROM node:20-alpine AS production
RUN apk add --no-cache openssl3

WORKDIR /app

# Install production dependencies
COPY package*.json ./ 
RUN npm ci --only=production

# Copy Prisma client from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy built application
COPY --from=builder /app/dist ./dist

# Copy Prisma schema and migrations
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3000

# Start the application after waiting for the database
CMD  npx prisma migrate deploy && node dist/main
