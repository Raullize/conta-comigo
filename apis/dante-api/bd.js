require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Erro ao adquirir cliente', err.stack);
    return;
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      console.error('Erro ao executar query', err.stack);
    } else {
      console.log('Conexão estabelecida com sucesso. Data/hora:', result.rows[0]);
    }
  });
});

module.exports = pool;
