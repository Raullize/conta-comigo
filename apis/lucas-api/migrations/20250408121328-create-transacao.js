'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transacaos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tipo: {
        type: Sequelize.STRING
      },
      valor: {
        type: Sequelize.FLOAT
      },
      descricao: {
        type: Sequelize.STRING
      },
      data: {
        type: Sequelize.DATE
      },
      contaId: {
        type: Sequelize.INTEGER
      },
      instituicaoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      usuarioCpf: {
        type: Sequelize.STRING, // deve ser STRING, conforme accounts.user_cpf
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Transacaos');
  }
};