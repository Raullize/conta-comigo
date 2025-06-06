import Sequelize, { Model } from 'sequelize';

class Account extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_cpf: Sequelize.STRING,
        institution_id: Sequelize.INTEGER,
        balance: Sequelize.DECIMAL,
        consent: Sequelize.BOOLEAN,
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
