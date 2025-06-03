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

RUN chmod +x ./entrypoint.sh

USER appuser

EXPOSE 3033

ENTRYPOINT ["/app/entrypoint.sh"]
CMD [ "npm", "start", "-s" ]