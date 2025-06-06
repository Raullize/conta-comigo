import Sequelize, { Model } from 'sequelize';

class Institution extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'institutions',
        timestamps: true,
        underscored: true,
      }
    );
  }
}

export default Institution;
