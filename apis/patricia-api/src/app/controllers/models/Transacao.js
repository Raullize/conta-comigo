/* eslint-disable */
import Sequelize, {Model} from 'sequelize';

class Transacao extends Model{
  static init(sequelize){
    super.init (
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        tipo: Sequelize.STRING,
        data: Sequelize.DATE,
        conta_id: Sequelize.INTEGER,
        descricao: Sequelize.STRING,
        valor: Sequelize.DECIMAL,
        destinatario_id: Sequelize.INTEGER
      },
      {
        sequelize,
        tableName: 'transacao',
        modelName: 'Transacao',
        timestamps: true,       
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
    return this;
  }
  static associate(models){
    this.belongsTo(models.Conta, {foreignKey: 'conta_id', as: 'conta'});
  }
}

export default Transacao;
