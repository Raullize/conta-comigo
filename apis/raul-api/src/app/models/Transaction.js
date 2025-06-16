import Sequelize, { Model } from 'sequelize';

class Transaction extends Model {
  static init(sequelize) {
    super.init(
      {
        account_id: Sequelize.INTEGER,
        description: Sequelize.STRING,
        type: Sequelize.ENUM('entrada', 'saida'),
        value: Sequelize.DECIMAL(10, 2),
      },
      {
        sequelize,
        tableName: 'transactions',
        timestamps: true,
        underscored: true,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Account, { 
      foreignKey: 'account_id', 
      as: 'account' 
    });
  }
}

export default Transaction;
