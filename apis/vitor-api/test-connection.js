import Sequelize from "sequelize";
import databaseConfig from "./src/config/database.cjs";

const sequelize = new Sequelize(databaseConfig);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Conexão estabelecida com sucesso.");
  } catch (error) {
    console.error("Erro ao conectar:", error);
  } finally {
    await sequelize.close();
  }
}

testConnection();
