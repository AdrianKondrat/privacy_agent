FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG KOVERR_APP_ORIGIN
ARG WAITLIST_ORIGIN
RUN test -n "$KOVERR_APP_ORIGIN" && npm run build && npm prune --omit=dev --no-audit --no-fund
RUN mkdir -p /storage && chown node:node /storage

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4321 WAITLIST_DB_PATH=/storage/waitlist.sqlite
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /storage /storage
USER node
EXPOSE 4321
HEALTHCHECK --interval=30s CMD node -e "fetch('http://127.0.0.1:' + process.env.PORT + '/app/health/').then(r => { if (!r.ok) process.exitCode = 1 }).catch(() => { process.exitCode = 1 })"
CMD ["node", "./dist/server/entry.mjs"]
