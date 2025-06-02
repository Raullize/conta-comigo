  import Sequelize from "sequelize";
  import databaseConfigObject from "../config/database.js";
  import User from '../app/controllers/models/User.js';
  import Instituicao from "../app/controllers/models/Instituicao.js";
  import Conta from "../app/controllers/models/Conta.js";
  import Transacao from "../app/controllers/models/Transacao.js";

  const models = [ User, Instituicao, Conta , Transacao ];
  class Database {
    constructor() {
      this.init();
    }
    init() {

    const env =  'development';
    
    const envConfig = databaseConfigObject[env];

    if (!envConfig) {
      throw new Error(`Configuração para o ambiente "${env}" não encontrada em ../config/database.js. Verifique se a chave "${env}" existe.`);
    }

    this.connection = new Sequelize(
      envConfig.database,
      envConfig.username,
      envConfig.password,
      envConfig
    );


    models.forEach((model) => model.init(this.connection));
    models.forEach((model) => {
      if (model.associate) {
        model.associate(this.connection.models);
      }
    });
  }
}

  export default new Database();
