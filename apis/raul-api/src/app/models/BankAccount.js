import Sequelize, { Model } from 'sequelize';

class BankAccount extends Model {
  static init(sequelize) {
    super.init(
      {
        bank_name: Sequelize.STRING,
        agency: Sequelize.STRING,
        account_number: Sequelize.STRING,
        user_cpf: Sequelize.STRING,
        consent: Sequelize.BOOLEAN,
        account_type: Sequelize.ENUM('checking', 'savings', 'investment'),
        balance: Sequelize.DECIMAL(10, 2),
        is_active: Sequelize.BOOLEAN,
      },
      {
        sequelize,
        tableName:"bank_accounts",
        timestamps: true,       
        underscored: true
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    this.hasMany(models.Transaction, { foreignKey: 'account_id', as: 'transactions' });
  }
}

export default BankAccount;
