'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('budgets', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_cpf: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      limit_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      month: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addConstraint('budgets', {
      fields: ['user_cpf'],
      type: 'foreign key',
      name: 'fk_budgets_user',
      references: {
        table: 'users',
        field: 'cpf',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addIndex('budgets', {
      fields: ['user_cpf', 'category', 'month', 'year'],
      unique: true,
      name: 'unique_user_category_month_year',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('budgets', 'fk_budgets_user');
    await queryInterface.removeIndex('budgets', 'unique_user_category_month_year');
    await queryInterface.dropTable('budgets');
  },
};