'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process'); // 'process' já é global no Node.js, mas não há mal em declará-lo
const basename = path.basename(__filename);

// --- INÍCIO DOS LOGS DE DEBUG ---
console.log('--- DANTE API: DEBUG em models/index.js ---');
console.log('Valor de process.env.NODE_ENV:', process.env.NODE_ENV);

const env = process.env.NODE_ENV || 'development';
console.log('Ambiente Sequelize selecionado (variável "env"):', env);

const configFilePath = path.join(__dirname, '/../config/config.js');
console.log('Tentando carregar arquivo de configuração de:', configFilePath);

let configFromFile;
try {
  configFromFile = require(configFilePath);
  // Logar apenas as chaves do objeto carregado para evitar logs muito grandes ou erros com funções
  console.log('Objeto INTEIRO carregado de config.js (apenas chaves):', Object.keys(configFromFile || {}));
} catch (e) {
  console.error('ERRO CRÍTICO AO CARREGAR config.js:', e);
  process.exit(1); // Sai se não conseguir carregar o config.js
}

const config = configFromFile[env]; // Pega o bloco de configuração do ambiente específico

// Logar apenas as chaves do bloco de configuração para evitar logs muito grandes
console.log(`Bloco de CONFIGURAÇÃO para o ambiente "${env}" (apenas chaves):`, Object.keys(config || {}));

const db = {};
let sequelize;

if (!config) {
  console.error(`ERRO CRÍTICO: Configuração para o ambiente "${env}" NÃO FOI ENCONTRADA em config.js! Verifique se a chave "${env}" existe no objeto exportado.`);
  process.exit(1); // Sai se o bloco do ambiente específico não for encontrado
}

// Logar os parâmetros que serão efetivamente usados pelo Sequelize
console.log('Parâmetros QUE SERÃO USADOS para new Sequelize():');
console.log('  config.database:', config.database);
console.log('  config.username:', config.username);
console.log('  config.password:', config.password ? '******** (definida)' : config.password); // Não logar a senha em si
console.log('  config.host:', config.host); // <<< MUITA ATENÇÃO A ESTE VALOR!
console.log('  config.port:', config.port);
console.log('  config.dialect:', config.dialect);
console.log('  config.logging:', config.logging);
// --- FIM DOS LOGS DE DEBUG ---

if (config.use_env_variable) { // Esta condição provavelmente não será usada no seu caso
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  // Esta é a linha que provavelmente está sendo executada:
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Carrega os modelos (Mantenha o seu código original aqui)
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