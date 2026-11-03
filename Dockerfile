# Keep Node and pnpm versions in sync with .mise.toml
FROM node:26-alpine AS base
RUN npm install -g pnpm@10.34.3
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Vite dev server with hot reload; source is bind-mounted by compose.yaml.
# Compose keeps the node_modules volume across rebuilds, so sync it with the lockfile on start.
FROM deps AS dev
EXPOSE 8443
CMD ["sh", "-c", "pnpm install --frozen-lockfile --config.confirmModulesPurge=false && exec pnpm dev --host 0.0.0.0 --port 8443 --strictPort"]

FROM deps AS build
ARG SITE_ORIGIN=http://localhost:8080
ENV SITE_ORIGIN=$SITE_ORIGIN
COPY . .
RUN pnpm build:prod

# Static production build served by nginx
FROM nginx:1.29-alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
