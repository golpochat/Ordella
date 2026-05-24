# Generic Next.js 14 frontend (build from repo root)
# docker build -f infrastructure/docker/frontend/Dockerfile \
#   --build-arg APP_NAME=storefront -t ordella-storefront .

ARG APP_NAME=admin-ui
FROM node:20-alpine AS deps
WORKDIR /app
ARG APP_NAME
COPY package.json package-lock.json ./
COPY apps/${APP_NAME}/package.json ./apps/${APP_NAME}/
COPY apps/shared-ui/package.json ./apps/shared-ui/
COPY apps/shared-utils/package.json ./apps/shared-utils/
RUN npm ci --workspace=@ordella/${APP_NAME} --include-workspace-root

FROM node:20-alpine AS build
WORKDIR /app
ARG APP_NAME
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json turbo.json ./
COPY apps/shared-ui ./apps/shared-ui
COPY apps/shared-utils ./apps/shared-utils
COPY apps/${APP_NAME} ./apps/${APP_NAME}
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=@ordella/${APP_NAME}

FROM node:20-alpine AS runner
WORKDIR /app
ARG APP_NAME
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup -S ordella && adduser -S ordella -G ordella
COPY --from=build /app/apps/${APP_NAME}/.next/standalone ./
COPY --from=build /app/apps/${APP_NAME}/.next/static ./apps/${APP_NAME}/.next/static
COPY --from=build /app/apps/${APP_NAME}/public ./apps/${APP_NAME}/public
USER ordella
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "apps/${APP_NAME}/server.js"]
