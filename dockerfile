FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

COPY wait-for-db.js ./
COPY entrypoint.sh ./

RUN chmod +x ./entrypoint.sh

EXPOSE 3033

# Define o entrypoint
ENTRYPOINT ["./entrypoint.sh"]

CMD [ "npm", "start" ]