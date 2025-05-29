import Sequelize, { Model } from "sequelize";

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        cpf: {
          type: Sequelize.STRING,
          primaryKey: true,
        },
        name: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: "users",
      }
    );
  }
}

export default User;
