
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

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 3050

ENTRYPOINT ["entrypoint.sh"]

CMD ["node", "src/server/server.js"]