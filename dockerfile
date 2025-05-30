FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Copia o script de espera e o entrypoint
COPY wait-for-db.js ./
COPY entrypoint.sh ./

# Garante que o entrypoint.sh seja executável DENTRO da imagem
RUN chmod +x ./entrypoint.sh

EXPOSE 3033

# Define o entrypoint
ENTRYPOINT ["./entrypoint.sh"]

CMD [ "npm", "start" ]