import pg from 'pg'; 
const { Pool } = require('pg');
const DB_HOST = process.env.DB_HOST;
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
  connectionTimeoutMillis: 5000,
});

const MAX_RETRIES = 20;
const RETRY_INTERVAL = 5000; 
let retries = 0;

async function checkDbConnection() {
  
  try {
    const client = await pool.connect();
    client.release();
    pool.end();
    process.exit(0);
  } catch (err) {
    retries++;
    console.error(`DANTE_API (wait-for-db): Falha ao conectar (<span class="math-inline">\{retries\}/</span>{MAX_RETRIES}):`, err.message);
    if (retries < MAX_RETRIES) {
      console.log(`DANTE_API (wait-for-db): Nova tentativa em ${RETRY_INTERVAL / 1000} segundos...`);
      setTimeout(checkDbConnection, RETRY_INTERVAL);
    } else {
      console.error('DANTE_API (wait-for-db): Número máximo de tentativas atingido. Abortando.');
      pool.end();
      process.exit(1);
    }
  }
}
checkDbConnection();