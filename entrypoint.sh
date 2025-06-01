#!/bin/sh

# Espera o banco de dados estar pronto
echo "Aguardando o banco de dados..."
npm run wait-for-db 

# Verifica se o wait-for-db foi bem sucedido
if [ $? -ne 0 ]; then
  echo "Script wait-for-db falhou. A iniciar a aplicação pode não funcionar."
fi


npm run migrate

# Verifica se as migrations foram bem sucedidas
if [ $? -ne 0 ]; then
  echo "Migrations falharam. Verifique os logs."
fi

# Inicia Dockerfile CMD
echo "Iniciando a aplicação..."
exec "$@"