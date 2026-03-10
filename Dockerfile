# Frontend Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# copy only package files first for better caching
COPY package*.json ./
COPY pnpm-lock.yaml ./

# install dependencies needed for building
RUN corepack enable \
  && corepack prepare pnpm@latest --activate \
  && pnpm install --frozen-lockfile

# build-time API base URL (optional). Example usage:
#   docker build --build-arg VITE_API_BASE_URL=https://api.example.com .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# copy source code (node_modules excluded via .dockerignore)
COPY . .

# build the production bundle (uses VITE_* env vars including VITE_API_BASE_URL)
RUN pnpm build

# Production Stage
FROM nginx:alpine

# SPA configuration for Nginx
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# serve built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Healthcheck to ensure the UI is being served
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:80/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
