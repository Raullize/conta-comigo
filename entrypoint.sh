#!/bin/sh

# Espera o banco de dados estar pronto
echo "Aguardando o banco de dados..."
npm run wait-for-db # Executa o script Node.js que acabamos de criar

# Verifica se o wait-for-db foi bem sucedido
if [ $? -ne 0 ]; then
  echo "Script wait-for-db falhou. A iniciar a aplicação pode não funcionar."
  # Você pode decidir sair aqui se preferir: exit 1
fi

# Executa as migrations
echo "Executando migrations..."
npm run migrate # Assume que você tem `npm run migrate` no seu package.json

# Verifica se as migrations foram bem sucedidas
if [ $? -ne 0 ]; then
  echo "Migrations falharam. Verifique os logs."
  # Você pode decidir sair aqui se preferir: exit 1
fi

# Inicia a aplicação principal (o comando original do seu Dockerfile CMD)
echo "Iniciando a aplicação..."
exec "$@"