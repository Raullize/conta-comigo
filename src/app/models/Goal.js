'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Goal extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
      this.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'category',
      });
    }
  }
  Goal.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        field: 'user_id',
        allowNull: false,
      },
      categoryId:{
        type: DataTypes.INTEGER,
        field: 'category_id',
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      targetAmount: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'target_amount',
        allowNull: false,
      },
      currentAmount: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'current_amount',
        allowNull: false,
      },
      targetDate: {
        type: DataTypes.DATE,
        field: 'target_date',
      },
    },
    {
      sequelize,
      modelName: 'Goal',
      tableName: 'goals',
      timestamps: true,
      freezeTableName: true,
    }
  );
  return Goal;
};
