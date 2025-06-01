'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

let configFromFile;
const configFilePath = path.join(__dirname, '/../config/config.js');

try {
  configFromFile = require(configFilePath);
} catch (e) {
  console.error('ERRO CRÍTICO AO CARREGAR O ARQUIVO config.js:', configFilePath, e);
  throw new Error(`Não foi possível carregar o arquivo de configuração: ${configFilePath}. Erro original: ${e.message}`);
}

const config = configFromFile[env];
const db = {};
let sequelize;

if (!config) {
  const errorMessage = `Configuração para o ambiente "${env}" NÃO FOI ENCONTRADA em ${configFilePath}! Verifique se a chave "${env}" existe no objeto exportado.`;
  console.error(errorMessage);
  throw new Error(errorMessage);
}

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;