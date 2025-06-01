
if (!process.env.DB_USER || !process.env.DB_PASSWORD) { // Verifique se é DB_PASSWORD aqui
  console.error('\x1b[31m%s\x1b[0m', 'ERRO: Credenciais de banco de dados não configuradas!');
  console.error('Configure DB_USER e DB_PASSWORD.');
  
}

const config = {
  development: {
    username: process.env.DB_USER,    
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',                
    logging: false,
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};

export default config;