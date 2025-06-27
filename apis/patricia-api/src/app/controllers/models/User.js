import Sequelize, { Model } from 'sequelize';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        cpf: {
          type: Sequelize.STRING,
          primaryKey: true,
          allowNull: false,
          unique: true
        },
        name: Sequelize.STRING,
        email: Sequelize.STRING,
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        underscored: true,
      }
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.Conta, { foreignKey: 'user_cpf', as: 'contas' });
  }
}

export default User;
