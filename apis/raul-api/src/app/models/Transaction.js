import Sequelize, { Model } from 'sequelize';

class Transaction extends Model {
  static init(sequelize) {
    super.init(
      {
        description: Sequelize.STRING,
        amount: Sequelize.DECIMAL(10, 2),
        type: Sequelize.ENUM('deposit', 'withdrawal', 'transfer'),
        transaction_date: Sequelize.DATE,
        category: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.BankAccount, { foreignKey: 'account_id', as: 'account' });
  }
}

export default Transaction;
