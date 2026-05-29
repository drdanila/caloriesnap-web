FROM node:22-slim AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:22-slim

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY server.js .

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
