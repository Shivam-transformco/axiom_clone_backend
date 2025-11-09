# Node 20 on Alpine for small image
FROM node:20-alpine AS base
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci

# Build
COPY tsconfig.json ./
COPY src ./src
COPY public ./public
RUN npm run build

# Runtime image
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy only runtime bits
COPY --from=base /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=base /app/dist ./dist
COPY public ./public

# env
ENV PORT=4000
EXPOSE 4000

CMD ["node", "dist/index.js"]
