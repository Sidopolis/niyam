# Docker — Niyam Rules

## Core Principles

1. **Immutable images.** Containers are disposable. All state lives in volumes or external stores.
2. **Minimal attack surface.** Use the smallest base image that works. Every unnecessary package is a liability.
3. **Layer caching matters.** Order Dockerfile instructions from least to most frequently changing.
4. **One process per container.** A container runs one service. Use Compose for multi-service apps.
5. **Reproducible builds.** Pin base image digests and dependency versions. Same Dockerfile = same image.

## File Structure & Organization

```
project/
  Dockerfile              # Production image
  Dockerfile.dev          # Development image (optional)
  compose.yml             # Docker Compose (v2 format)
  .dockerignore           # Exclude unnecessary files from context
  scripts/
    healthcheck.sh        # Custom health check script
```

- Use `compose.yml` (not `docker-compose.yml`) for Compose v2.
- Keep `.dockerignore` comprehensive — node_modules, .git, build artifacts, secrets, IDE files.
- Separate dev and prod Dockerfiles when dev needs hot-reload, debug tools, or source maps.

## Multi-Stage Builds

- Use multi-stage builds to separate build dependencies from the runtime image.
- Name stages clearly: `FROM node:20-alpine AS builder`, `FROM node:20-alpine AS runner`.
- Copy only production artifacts into the final stage — no source code, no dev dependencies.
- Use `--from=builder` to cherry-pick built files.

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 appgroup && adduser -u 1001 -G appgroup -s /bin/sh -D appuser
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER appuser
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

## Layer Caching

- Copy dependency manifests (`package.json`, `requirements.txt`) before source code.
- Run `npm ci` / `pip install` immediately after copying manifests — this layer caches until deps change.
- Place frequently changing files (source code) last in the Dockerfile.
- Use `.dockerignore` to exclude test files, docs, and local configs from the build context.
- Use `--mount=type=cache` for package manager caches in BuildKit.

## .dockerignore

- Always include: `node_modules`, `.git`, `dist`, `build`, `.env*`, `*.log`, `.DS_Store`, `coverage`.
- Mirror your `.gitignore` then add build artifacts and IDE files.
- Never send secrets into the build context — `.dockerignore` is your first defense.

## Compose

- Use `compose.yml` with named services, networks, and volumes.
- Pin image versions in compose. Never use `:latest` in production.
- Use `depends_on` with `condition: service_healthy` for startup ordering.
- Use `env_file` for environment variables — never inline secrets in compose files.
- Define named volumes for persistent data. Bind mounts only for development.
- Use profiles for optional services: `profiles: ["debug"]`.

```yaml
services:
  app:
    build:
      context: .
      target: runner
    ports: ["3000:3000"]
    depends_on:
      db:
        condition: service_healthy
    env_file: .env
  db:
    image: postgres:16-alpine
    volumes: [db-data:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      retries: 5
volumes:
  db-data:
```

## Health Checks

- Define `HEALTHCHECK` in Dockerfile or `healthcheck` in compose for every service.
- Use lightweight checks: HTTP GET to a health endpoint, TCP socket, or CLI command.
- Set reasonable intervals (10-30s), timeouts (5s), and retries (3-5).
- Health checks should verify the service can serve requests, not just that the process is alive.

## Anti-Patterns (Never Do)

- Never use `latest` tag in production — it's unpinned and unreproducible.
- Never run containers as root. Always create and switch to a non-root user.
- Never store secrets in image layers (`ENV`, `COPY .env`). Use runtime secrets.
- Never install development dependencies in production images.
- Never use `ADD` when `COPY` suffices — `ADD` has implicit decompression and URL fetching.
- Never put `apt-get update` and `apt-get install` in separate `RUN` layers.
- Never ignore `.dockerignore` — large build contexts slow everything down.
- Never use `ENTRYPOINT` with shell form when you need signal handling.

## Security

- Scan images with `docker scout`, Trivy, or Snyk before deploying.
- Use distroless or `-alpine` base images to minimize CVE surface.
- Pin base images to digest: `FROM node:20-alpine@sha256:abc123...`.
- Never install unnecessary tools (curl, wget, bash) in production images unless health checks require them.
- Set filesystem to read-only where possible: `read_only: true` in compose.
- Drop all capabilities and add back only what's needed: `cap_drop: [ALL]`.
- Use `COPY --chown=appuser:appgroup` to avoid root-owned files.

## Performance

- Keep images small. Track image size and set budgets (e.g., <200MB for Node apps).
- Use BuildKit (`DOCKER_BUILDKIT=1`) for parallel stage execution and cache mounts.
- Use `--mount=type=cache,target=/root/.npm` to persist package caches across builds.
- Combine `RUN` commands with `&&` to reduce layer count.
- Use `docker compose build --parallel` for multi-service builds.
- Leverage layer caching in CI with `--cache-from` and registry-backed caches.
