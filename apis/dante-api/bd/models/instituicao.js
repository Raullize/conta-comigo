module.exports = (sequelize, DataTypes) => {
  const Instituicao = sequelize.define('Instituicao', {
    nome: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'instituicoes'
  });

  Instituicao.associate = function(models) {
    Instituicao.hasMany(models.Conta, { foreignKey: 'instituicaoId' });
  };

  return Instituicao;
};