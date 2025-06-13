import Sequelize, { Model } from 'sequelize';

class Account extends Model {
  static init(sequelize) {
    super.init(
      {
        id: Sequelize.INTEGER,
        user_cpf: Sequelize.STRING,
        institution_id: Sequelize.INTEGER,
        balance: Sequelize.DECIMAL,
      },
      {
        sequelize,
        tableName: 'accounts',
        timestamps: true,
        underscored: true,
      }
    );
  }
}

export default Account;
