"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const institutions = [
      {
        name: "Banco do Brasil",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Caixa Econômica Federal",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Bradesco",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Itaú",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Santander",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert("institutions", institutions, {});
  },

  async down(queryInterface, Sequelize) {
    return Promise.resolve();
  },
};
