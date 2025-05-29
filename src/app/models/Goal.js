'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Goal extends Model {
    
    static associate(models) {
      Goal.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'users'
      }),
      Goal.belongsTo(models.Category, {
        foreignKey: 'cetegory_id',
        as: 'category'
      }),
    }
  }
  Goal.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      target_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      current_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      target_date: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: 'Goal',
      tableName: 'goals',
    }
  );
  return Goal;
};

