import Sequelize, { Model } from "sequelize";

class Account extends Model {
  static init(sequelize) {
    super.init(
      {
        user_cpf: Sequelize.STRING,
        institution_id: Sequelize.INTEGER,
        balance: Sequelize.DECIMAL,
      },
      {
        sequelize,
        tableName: "accounts",
      }
    );
  }
}

export default Account;
