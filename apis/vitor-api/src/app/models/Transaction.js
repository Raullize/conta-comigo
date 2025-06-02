import Sequelize, { Model } from "sequelize";

class Transaction extends Model {
  static init(sequelize) {
    super.init(
      {
        origin_cpf: Sequelize.STRING,
        destination_cpf: Sequelize.STRING,
        institution_id: Sequelize.INTEGER,
        value: Sequelize.STRING,
        type: Sequelize.CHAR,
        description: Sequelize.STRING,
      },
      {
        sequelize,
        table: "transactions",
      }
    );
  }
}

export default Transaction;
