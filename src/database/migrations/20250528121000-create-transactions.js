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
      id_bank: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      category: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
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

    await queryInterface.addConstraint('transactions', {
      fields: ['origin_cpf', 'id_bank'],
      type: 'foreign key',
      name: 'fk_transactions_origin',
      references: {
        table: 'accounts',
        fields: ['user_cpf', 'id_bank'],
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('transactions', {
      fields: ['destination_cpf', 'id_bank'],
      type: 'foreign key',
      name: 'fk_transactions_destination',
      references: {
        table: 'accounts',
        fields: ['user_cpf', 'id_bank'],
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
