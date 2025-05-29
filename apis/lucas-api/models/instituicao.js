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
    nome: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Instituicao',
  });
  return Instituicao;
};