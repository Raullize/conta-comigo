module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accounts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_cpf: {
        type: Sequelize.STRING,
        allowNull: false,
        references: { model: 'users', key: 'cpf' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      balance: {
        type: Sequelize.DECIMAL,
        defaultValue: 0.0,
      },
      consent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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

    await queryInterface.addConstraint('accounts', {
      fields: ['user_cpf', 'idBank'],
      type: 'unique',
      name: 'accounts_user_cpf_idBank_key',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('accounts');
  },
};