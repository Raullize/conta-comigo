'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Investment extends Model {
    static associate(models) {
      Investment.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'users',
      });
      Investment.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'categories',
      });
    }
  }
  Investment.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      value: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Investment',
      tableName: 'investments',
    }
  );
  return Investment;
};
