'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    static associate(models) {
     this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
     }),
    }
  }
  Account.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'User', key: 'id' }
    },
    institution: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Account',
    tableName: 'accounts'
  });
  
  return Account;
};
