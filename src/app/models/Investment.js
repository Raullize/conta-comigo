'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Investment extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'users',
      });
      
    }
  }
  Investment.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        field: 'user_id',
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
      timestamps: true,
      freezeTableName: true,
    }
  );
  return Investment;
};
