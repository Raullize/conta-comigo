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
      id_bank: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'id_bank'
      },
      user_cpf: DataTypes.STRING,
      balance: DataTypes.DECIMAL,
      consent: DataTypes.BOOLEAN,
      institution_name: DataTypes.STRING,
      api_source: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'vitor',
        field: 'api_source'
      },
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