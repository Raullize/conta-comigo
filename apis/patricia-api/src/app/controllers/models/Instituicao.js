import Sequelize, { Model } from 'sequelize';

class Instituicao extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: Sequelize.STRING,

      },
      {
        sequelize,

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
