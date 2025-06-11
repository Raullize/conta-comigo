'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Account extends Model {}

  Account.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      idBank: DataTypes.INTEGER,
      user_cpf: DataTypes.STRING,
      balance: DataTypes.DECIMAL,
      consent: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'Account',
      tableName: 'accounts',
      timestamps: true,
      underscored: true,
    }
  );

  return Account;
};
