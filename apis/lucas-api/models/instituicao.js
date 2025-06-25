'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Instituicao extends Model {

    static associate(models) {
      Instituicao.hasMany(models.Conta, {
        foreignKey: 'instituicaoId', as: 'contas'
      });
    }

  }
  Instituicao.init({
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Instituicao',
    timestamps: true,
    createdAt: true,
    updatedAt: true,
    tableName: 'Instituicaos',
    freezeTableName: false
  });
  return Instituicao;
};