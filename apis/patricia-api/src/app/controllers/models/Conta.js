import Sequelize, {Model} from 'sequelize';

class Conta extends Model {
  static init(sequelize){
    super.init(
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_cpf: Sequelize.STRING,
        consent: Sequelize.BOOLEAN,
        numero: Sequelize.STRING,
        saldo: Sequelize.DECIMAL,
        instituicao_id: Sequelize.INTEGER,
      },
      {
        sequelize,
        tableName: 'contas',
        modelName: 'Conta',
        timestamps: false,       
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
    return this;

  }

  static associate(models){
    this.belongsTo(models.User, {foreignKey: 'user_cpf', as: 'usuario'});
    this.belongsTo(models.Instituicao, {foreignKey: 'instituicao_id', as: 'instituicao'});
    this.hasMany(models.Transacao, {foreignKey: 'conta_id', as: 'transacoes'})

  }
}

export default Conta;
