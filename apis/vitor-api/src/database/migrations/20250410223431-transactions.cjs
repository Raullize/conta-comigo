"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("transactions", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      origin_cpf: {
        type: Sequelize.STRING, // deve ser STRING, conforme accounts.user_cpf
        allowNull: true,
      },
      destination_cpf: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      institution_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      value: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      type: {
        type: Sequelize.CHAR,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    // Constraint para a conta de origem: (origin_cpf, institution_id)
    await queryInterface.addConstraint("transactions", {
      fields: ["origin_cpf", "institution_id"],
      type: "foreign key",
      name: "fk_transactions_origin", // nome da constraint
      references: {
        table: "accounts",
        fields: ["user_cpf", "institution_id"],
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // Constraint para a conta de destino: (destination_cpf, institution_id)
    await queryInterface.addConstraint("transactions", {
      fields: ["destination_cpf", "institution_id"],
      type: "foreign key",
      name: "fk_transactions_destination",
      references: {
        table: "accounts",
        fields: ["user_cpf", "institution_id"],
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "transactions",
      "fk_transactions_origin"
    );
    await queryInterface.removeConstraint(
      "transactions",
      "fk_transactions_destination"
    );
    await queryInterface.dropTable("transactions");
  },
};
