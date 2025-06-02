/* eslint-disable */
import Sequelize, {Model} from 'sequelize';

class Transacao extends Model{
  static init(sequelize){
    super.init (
      {
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

      }
    );
    return this;
  }
  static associate(models){
    this.belongsTo(models.Conta, {foreignKey: 'conta_id', as: 'conta'});
  }
}

export default Transacao;
