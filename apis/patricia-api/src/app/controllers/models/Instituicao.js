import Sequelize, { Model } from 'sequelize';

class Instituicao extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
         },
        nome: Sequelize.STRING,
      },
      {
        sequelize,
        modelName: 'Instituicao',
        tableName: 'instituicao',
        timestamps: true,
        underscored: true,

        tableName: 'instituicao',
        timestamps: false,
        underscored: true,
        }
    );
    return this;
  }

  static associate(models) {

  }
}

export default Instituicao;
