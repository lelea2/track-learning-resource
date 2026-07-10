# syntax=docker/dockerfile:1

# --- Build stage: install deps, typecheck, and build the client bundle ---
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# tsc -b (typecheck client+server) && vite build (client bundle -> dist/)
RUN npm run build


# --- Runtime stage: only what's needed to run the Express server ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# The server (run via tsx, no separate server build step — see CLAUDE.md)
# imports only from server/, src/types/, and src/utils/.
COPY server ./server
COPY src/types ./src/types
COPY src/utils ./src/utils
# Client bundle the server serves as static files in production.
COPY --from=builder /app/dist ./dist

# Railway injects PORT at runtime; this is just the documented default.
EXPOSE 3001

CMD ["npm", "start"]
