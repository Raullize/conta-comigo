'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Transacao extends Model {

    static associate(models) {
      Transacao.belongsTo(models.Conta, { foreignKey: 'contaId', as: 'contas' });
    }

  }
  Transacao.init({
    tipo: DataTypes.STRING,
    valor: DataTypes.FLOAT,
    contaId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Transacao',
  });
  return Transacao;
};