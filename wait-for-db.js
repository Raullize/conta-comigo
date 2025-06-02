// wait-for-db.js
const { Pool } = require('pg');
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_PORT = process.env.DB_PORT;

const pool = new Pool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: parseInt(DB_PORT, 10),
  connectionTimeoutMillis: 5000,
});

const MAX_RETRIES = 20;
const RETRY_INTERVAL = 5000; 

let retries = 0;

async function checkDbConnection() {
  try {
    const client = await pool.connect();
    client.release();
    process.exit(0); 
  } catch (err) {
    retries++;
    console.error(`CONTA COMIGO - API Falha ao conectar ao banco (${retries}/${MAX_RETRIES}):`, err.message);
    if (retries < MAX_RETRIES) {
      console.log(`CONTA COMIGO - API Nova tentativa em ${RETRY_INTERVAL / 1000} segundos...`);
      setTimeout(checkDbConnection, RETRY_INTERVAL);
    } else {
      console.error('CONTA COMIGO - API - Número máximo de tentativas atingido. Abortando.');
      process.exit(1);
    }
  }
}

checkDbConnection();