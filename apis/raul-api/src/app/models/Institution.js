import Sequelize, { Model } from 'sequelize';

class Institution extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'institutions',
        timestamps: true,
        underscored: true,
      }
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.Account, { 
      foreignKey: 'institution_id', 
      as: 'accounts' 
    });
  }
}

export default Institution; 