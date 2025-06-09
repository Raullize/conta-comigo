module.exports = {
 async up (queryInterface, Sequelize) {
    await queryInterface.createTable('contas', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      user_cpf: {
        type: Sequelize.STRING,
        allowNull: false,
        references: { model: 'users', key: 'cpf' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', 
      },
      numero: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      saldo: {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      consent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
        instituicao_id: {
        type: Sequelize.INTEGER,
        references: {model: 'instituicao', key: 'id'},
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
     },
     { 
      uniqueKeys: {
          unique_user_instituicao: {
            fields: ['user_cpf', 'instituicao_id'],
          },
        },
     }
    );
  },
  async down (queryInterface) {
    await queryInterface.dropTable('contas');
  },
};
