import Sequelize, { Model } from "sequelize";

class Institution extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: "institutions",
      }
    );
  }
}

export default Institution;
