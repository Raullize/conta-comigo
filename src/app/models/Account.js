'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    static associate(models) {
      // define association here
    }
  }
  Account.init(
    {
      user_id: DataTypes.INTEGER,
      institution: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Account',
    }
  );
  return Account;
};
