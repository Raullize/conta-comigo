FROM node:18-alpine AS deps
WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev --production

FROM node:18-alpine AS runtime
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules

COPY package.json ./

COPY . .

USER appuser

EXPOSE 3003

CMD [ "npm", "start", "-s" ]