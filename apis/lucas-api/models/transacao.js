'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Transacao extends Model {

    static associate(models) {
      Transacao.belongsTo(models.Conta, { foreignKey: 'contaId', as: 'contas' });
      Transacao.belongsTo(models.Instituicao, { foreignKey: 'instituicaoId', as: 'instituicao' });
    }

  }
  Transacao.init({
    usuarioCpf: DataTypes.STRING,
    instituicaoId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    data: DataTypes.DATE,
    descricao: DataTypes.STRING,
    tipo: DataTypes.STRING,
    valor: DataTypes.FLOAT,
    contaId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Transacao',
    timestamps: true,
  });
  return Transacao;
};