module.exports = (sequelize, DataTypes) => {
    const Conta = sequelize.define('Conta', {
      saldo: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      instituicaoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      consent: DataTypes.BOOLEAN,
      usuarioCpf: {
        type: DataTypes.STRING,
        references: {
          model: 'Usuario',
          as: 'usuario',
          key: 'cpf'
        }
      },
    }, {
      tableName: 'Contas'
    });
  
    Conta.associate = function(models) {
      Conta.belongsTo(models.Usuario, { foreignKey: 'usuarioId' });
      Conta.belongsTo(models.Instituicao, { foreignKey: 'instituicaoId' });
      Conta.hasMany(models.Transacao, { foreignKey: 'contaId' });
    };
  
    return Conta;
  };
  
  