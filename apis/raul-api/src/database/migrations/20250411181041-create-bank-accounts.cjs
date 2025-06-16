'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_cpf: {
        allowNull: false,
        type: Sequelize.STRING,
        references: {
          model: 'users',
          key: 'cpf'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      institution_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'institutions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      balance: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      consent: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('accounts');
  }
};
