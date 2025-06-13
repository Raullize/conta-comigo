// XXXXXXXXXXXXXX-create-accounts.js
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accounts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_cpf: {
        type: Sequelize.STRING(11), // Tipo igual ao da tabela users
        allowNull: false,
        references: { 
          model: 'users', 
          key: 'user_cpf' // ← Referencia a chave primária de users
        },
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
