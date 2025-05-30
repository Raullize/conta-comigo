require('dotenv').config();

// Verificação das variáveis de ambiente necessárias
if (!process.env.DB_USER || !process.env.DB_PASS) {
  console.error('\x1b[31m%s\x1b[0m', 'ERRO: Credenciais de banco de dados não configuradas!');
  console.error('Por favor, configure as variáveis DB_USER e DB_PASS no arquivo .env');
  console.error('Veja o arquivo .env.example para referência.');
}

module.exports = {
  dialect: process.env.DB_DIALECT || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME || 'api_contas_bancarias',
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
