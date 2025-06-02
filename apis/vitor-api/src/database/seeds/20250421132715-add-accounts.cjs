"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const accounts = [
      {
        user_cpf: "00000000001",
        institution_id: 2,
        balance: 1000.0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_cpf: "00000000002",
        institution_id: 9,
        balance: 500.0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_cpf: "00000000003",
        institution_id: 9,
        balance: 750.0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_cpf: "00000000004",
        institution_id: 5,
        balance: 800.0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_cpf: "00000000005",
        institution_id: 8,
        balance: 900.0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_cpf: "00000000006",
        institution_id: 3,
        balance: 1200.0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_cpf: "00000000007",
        institution_id: 2,
        balance: 1500.0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_cpf: "00000000008",
        institution_id: 2,
        balance: 1300.0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_cpf: "00000000009",
        institution_id: 8,
        balance: 600.0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_cpf: "00000000010",
        institution_id: 5,
        balance: 1100.0,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert("accounts", accounts, {});
  },

  async down(queryInterface, Sequelize) {
    return Promise.resolve();
  },
};
