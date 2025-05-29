// wait-for-db.js
const { Pool } = require('pg');
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_PORT = process.env.DB_PORT || 5432;

const pool = new Pool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: parseInt(DB_PORT, 10),
  connectionTimeoutMillis: 5000, // Tempo para tentar conectar
});

const MAX_RETRIES = 20;
const RETRY_INTERVAL = 5000; // 5 segundos

let retries = 0;

async function checkDbConnection() {
  console.log(`Tentando conectar ao banco de dados: ${DB_HOST}:${DB_PORT}, database: ${DB_NAME}, user: ${DB_USER}`);
  try {
    const client = await pool.connect();
    console.log('Banco de dados conectado com sucesso!');
    client.release();
    process.exit(0); // Sucesso, pode prosseguir
  } catch (err) {
    retries++;
    console.error(`Falha ao conectar ao banco (${retries}/${MAX_RETRIES}):`, err.message);
    if (retries < MAX_RETRIES) {
      console.log(`Nova tentativa em ${RETRY_INTERVAL / 1000} segundos...`);
      setTimeout(checkDbConnection, RETRY_INTERVAL);
    } else {
      console.error('Número máximo de tentativas atingido. Abortando.');
      process.exit(1); // Falha, aborta
    }
  }
}

checkDbConnection();