# 1. Build stage
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm install --frozen-lockfile

# Install Chrome for Puppeteer
RUN npx puppeteer browsers install chrome

COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js app
RUN npm run build

# 2. Production image
FROM node:20 AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /root/.cache/puppeteer /root/.cache/puppeteer

# Expose the port
EXPOSE 3000

# Start the app
CMD ["npm", "start"] 