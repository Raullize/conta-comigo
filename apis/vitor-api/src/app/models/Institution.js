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
        timestamps: true,       
        underscored: true
      }
    );
  }
}

export default Institution;
