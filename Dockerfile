FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci
COPY . .
RUN DATABASE_URL=file:/tmp/build-only.db npm run build
RUN mkdir /data && chown node:node /data
USER node

FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
RUN mkdir /data && chown node:node /data
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
USER node
VOLUME ["/data"]
EXPOSE 3000
CMD ["node", "server.js"]
