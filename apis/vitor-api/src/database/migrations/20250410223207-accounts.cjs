module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "accounts",
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_cpf: {
          type: Sequelize.STRING,
          allowNull: false,
          references: { model: "users", key: "cpf" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL", // Corrigido
        },
        institution_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: "institutions", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL", // Corrigido
        },
        balance: {
          type: Sequelize.DECIMAL,
          defaultValue: 0.0,
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updated_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      },
      {
        uniqueKeys: {
          unique_user_institution: {
            fields: ["user_cpf", "institution_id"],
          },
        },
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("accounts");
  },
};
