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

    // Remover coluna conta_destino_id (não usada mais após simplificação para entrada/saida)
    await queryInterface.removeColumn('transacoes', 'conta_destino_id');
  },

  async down(queryInterface, Sequelize) {
    // Adicionar de volta a coluna conta_destino_id
    await queryInterface.addColumn('transacoes', 'conta_destino_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    
    await queryInterface.removeConstraint('transacoes', 'fk_transacoes_conta');
    await queryInterface.removeConstraint('contas', 'fk_contas_instituicao');
    await queryInterface.removeConstraint('contas', 'fk_contas_usuario');
  }
};
