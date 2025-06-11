module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      origin_cpf: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      destination_cpf: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      value: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      type: {
        type: Sequelize.CHAR,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      idBank: {
        type: Sequelize.INTEGER, // Corrigido para INTEGER
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

    // Foreign key para conta de origem
    await queryInterface.addConstraint('transactions', {
      fields: ['origin_cpf', 'idBank'],
      type: 'foreign key',
      name: 'fk_transactions_origin',
      references: {
        table: 'accounts',
        fields: ['user_cpf', 'idBank'],
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Foreign key para conta de destino
    await queryInterface.addConstraint('transactions', {
      fields: ['destination_cpf', 'idBank'],
      type: 'foreign key',
      name: 'fk_transactions_destination',
      references: {
        table: 'accounts',
        fields: ['user_cpf', 'idBank'],
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint(
      'transactions',
      'fk_transactions_origin'
    );
    await queryInterface.removeConstraint(
      'transactions',
      'fk_transactions_destination'
    );
    await queryInterface.dropTable('transactions');
  },
};
