'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Transacoes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      tipo: {
        type: Sequelize.ENUM('credito', 'debito'),
        allowNull: false,
      },
      valor: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false,
      },
      descricao: {
        type: Sequelize.STRING,
      },
      contaId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Contas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Transacoes');
  }
};
