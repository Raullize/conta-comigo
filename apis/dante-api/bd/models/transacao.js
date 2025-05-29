module.exports = (sequelize, DataTypes) => {
    const Transacao = sequelize.define('Transacao', {
      tipo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      valor: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      descricao: {
        type: DataTypes.STRING,
      },
      contaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    }, {
      tableName: 'Transacoes',
      updatedAt: false
    });
  
    Transacao.associate = function(models) {
      Transacao.belongsTo(models.Conta, { foreignKey: 'contaId' });
    };
  
    return Transacao;
  };