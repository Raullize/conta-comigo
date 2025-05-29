'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Goal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Goal.init(
    {
      user_id: DataTypes.INTEGER,
      title: DataTypes.STRING,
      target_amount: DataTypes.DECIMAL,
      current_amount: DataTypes.DECIMAL,
      target_date: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Goal',
    }
  );
  return Goal;
};
