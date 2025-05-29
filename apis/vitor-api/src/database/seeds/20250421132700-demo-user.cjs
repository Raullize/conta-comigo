"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const users = [
      {
        cpf: "00000000001",
        name: "Wandreus",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        cpf: "00000000002",
        name: "Gabriel",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        cpf: "00000000003",
        name: "Vitor",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        cpf: "00000000004",
        name: "Usuário 4",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        cpf: "00000000005",
        name: "Usuário 5",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        cpf: "00000000006",
        name: "Usuário 6",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        cpf: "00000000007",
        name: "Usuário 7",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        cpf: "00000000008",
        name: "Usuário 8",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        cpf: "00000000009",
        name: "Usuário 9",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        cpf: "00000000010",
        name: "Usuário 10",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert("users", users, {});
  },

  async down(queryInterface, Sequelize) {},
};
