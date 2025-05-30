FROM node:18 AS builder
WORKDIR /app

COPY package*.json ./

RUN npm install
COPY . .

FROM node:18-alpine
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src

EXPOSE 3001

CMD ["node", "src/server/server.js"]