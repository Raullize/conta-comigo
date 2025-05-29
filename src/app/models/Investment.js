'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Investment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Investment.init(
    {
      user_id: DataTypes.INTEGER,
      value: DataTypes.DECIMAL,
      type: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Investment',
    }
  );
  return Investment;
};
