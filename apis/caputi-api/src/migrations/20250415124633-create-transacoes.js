'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('transacoes', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    conta_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'contas',
        key: 'id_conta',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    tipo: {
      type: Sequelize.ENUM('deposito', 'saque', 'transferencia'),
      allowNull: false,
    },
    valor: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    descricao: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('transacoes');
}
