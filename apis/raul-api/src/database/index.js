import 'dotenv/config';
import Sequelize from 'sequelize';
import databaseConfig from '../config/database';

import BankAccount from '../app/models/BankAccount';
import Transaction from '../app/models/Transaction';
import User from '../app/models/User';

const models = [User, BankAccount, Transaction];

class Database {
  constructor() {
    this.init();
  }

  init() {
    // databaseConfig é o arquivo de configuração do banco de dados
    this.connection = new Sequelize(databaseConfig);

    models
      .map((model) => model.init(this.connection))
      .map((model) => model.associate && model.associate(this.connection.models));
  }
}

export default new Database();
