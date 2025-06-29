import Sequelize, { Model } from 'sequelize';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        cpf: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'users',
        timestamps: true,       
        underscored: true,
      }
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.Account, { 
      foreignKey: 'user_cpf', 
      sourceKey: 'cpf',
      as: 'accounts' 
    });
  }
}

export default User;
