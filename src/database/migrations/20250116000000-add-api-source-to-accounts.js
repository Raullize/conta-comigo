'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('accounts', 'api_source', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'vitor', // Padrão para contas existentes
      comment: 'Identifica qual API usar: lucas, patricia, dante, raul, vitor'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('accounts', 'api_source');
  }
};