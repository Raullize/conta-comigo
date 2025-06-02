'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    
    await queryInterface.addConstraint('contas', {
      fields: ['usuario_id'],
      type: 'foreign key',
      name: 'fk_contas_usuario',
      references: {
        table: 'usuarios',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    
    await queryInterface.addConstraint('contas', {
      fields: ['instituicao_id'],
      type: 'foreign key',
      name: 'fk_contas_instituicao',
      references: {
        table: 'instituicoes',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    
    await queryInterface.addConstraint('transacoes', {
      fields: ['conta_id'],
      type: 'foreign key',
      name: 'fk_transacoes_conta',
      references: {
        table: 'contas',
        field: 'id_conta',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    
    await queryInterface.addConstraint('transacoes', {
      fields: ['conta_destino_id'],
      type: 'foreign key',
      name: 'fk_transacoes_conta_destino',
      references: {
        table: 'contas',
        field: 'id_conta',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('transacoes', 'fk_transacoes_conta_destino');
    await queryInterface.removeConstraint('transacoes', 'fk_transacoes_conta');
    await queryInterface.removeConstraint('contas', 'fk_contas_instituicao');
    await queryInterface.removeConstraint('contas', 'fk_contas_usuario');
  }
};
