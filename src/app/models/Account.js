'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'id',
        as: 'user',
      });
    }
  }
  Account.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: { model: 'users', key: 'id' },
      },
      institution: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Account',
      tableName: 'accounts',
      freezeTableName: true,
    }
  );

  Account.associate = (models) => {
  Account.belongsTo(models.User, {
    foreignKey: 'userId', 
    as: 'user',
    })
  }

  return Account;
}
