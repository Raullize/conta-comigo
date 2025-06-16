import Sequelize from 'sequelize';
import databaseConfigObject from '../config/database.js';

import User from '../app/models/User.js';
import Institution from '../app/models/Institution.js';
import Account from '../app/models/BankAccount.js';
import Transaction from '../app/models/Transaction.js';

const models = [User, Institution, Account, Transaction];

class Database {
  constructor() {
    this.init();
  }
  
  init() {
    const env = 'development';
    
    const envConfig = databaseConfigObject[env];

    if (!envConfig) {
      throw new Error(`Configuração para o ambiente "${env}" não encontrada em ../config/database.js. Verifique se a chave "${env}" existe.`);
    }

    this.connection = new Sequelize(
      envConfig.database,
      envConfig.username,
      envConfig.password,
      envConfig
    );

    models.forEach((model) => model.init(this.connection));
    models.forEach((model) => {
      if (model.associate) {
        model.associate(this.connection.models);
      }
    });
  }
}

export default new Database();
