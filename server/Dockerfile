FROM node:22-slim AS deps

WORKDIR /app
COPY package*.json ./
RUN npm install --production

FROM node:22-slim

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY server.js .
COPY lib ./lib

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
