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
      id_bank: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      institution_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      api_source: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'vitor',
        comment: 'Identifica qual API usar: lucas, patricia, dante, raul, vitor, caputi'
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
      fields: ['user_cpf', 'id_bank'],
      type: 'unique',
      name: 'accounts_user_cpf_id_bank_key',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('accounts');
  },
};