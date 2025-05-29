module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('transacao',{
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      tipo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      data: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      conta_id: {
        type: Sequelize.INTEGER,
        references: {model: 'contas', key: 'id'},
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: false,
      },
      valor: {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      descricao: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      destinatario_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('transacao');
  },

  };

