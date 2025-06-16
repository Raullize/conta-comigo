import Sequelize, { Model } from 'sequelize';

class Account extends Model {
  static init(sequelize) {
    super.init(
      {
        user_cpf: Sequelize.STRING,
        institution_id: Sequelize.INTEGER,
        balance: Sequelize.DECIMAL(10, 2),
        consent: Sequelize.BOOLEAN,
      },
      {
        sequelize,
        tableName: 'accounts',
        timestamps: true,
        underscored: true,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { 
      foreignKey: 'user_cpf', 
      targetKey: 'cpf',
      as: 'user' 
    });
    this.belongsTo(models.Institution, { 
      foreignKey: 'institution_id', 
      as: 'institution' 
    });
    this.hasMany(models.Transaction, { 
      foreignKey: 'account_id', 
      as: 'transactions' 
    });
  }
}

export default Account;
