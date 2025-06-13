const { Sequelize } = require('sequelize');
const sequelizeConnection = require('./database');

const User = require('../app/models/User');
const Category = require('../app/models/Category');
const Account = require('../app/models/Account');
const Goal = require('../app/models/Goal');
const Transaction = require('../app/models/Transaction');
const models = [User, Transaction, Category, Account, Goal];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = sequelizeConnection;

    models
      .map(model => model(this.connection, Sequelize.DataTypes))
      .forEach(model => {
        if (model.associate) {
          model.associate(this.connection.models);
        }
      });
  }
}
const database = new Database();

module.exports = {
  connection: database.connection,
  models: database.connection.models,
};
