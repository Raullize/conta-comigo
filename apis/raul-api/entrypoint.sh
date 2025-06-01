#!/bin/sh

npm run wait-for-db

if [ $? -ne 0 ]; then
  echo "RAUL_API (entrypoint): Script wait-for-db FALHOU. A aplicação não será iniciada."
  exit 1
fi

npm run migrate > /dev/null 2>&1

if [ $? -ne 0 ]; then
  echo "RAUL-API (entrypoint): Migrations FALHARAM! (Saída suprimida, verifique o código de saída)."
  echo "RAUL-API (entrypoint): A aplicação não será iniciada."
  exit 1
fi

exec "$@"