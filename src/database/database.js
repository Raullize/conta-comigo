// 1. Importação com require()
const { Sequelize } = require('sequelize'); // Importa Sequelize
const dotenv = require('dotenv'); // Importa dotenv

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = sequelize;
