'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {}

  Transaction.init(
    {
      origin_cpf: DataTypes.STRING,
      destination_cpf: DataTypes.STRING,
      value: DataTypes.DECIMAL,
      type: DataTypes.CHAR,
      description: DataTypes.STRING,
      id_bank: DataTypes.INTEGER,
      category: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Transaction',
      tableName: 'transactions',
      timestamps: true,
      underscored: true,
    }
  );

  return Transaction;
};
