  import Sequelize from "sequelize";
  import databaseConfig from "../config/database.js";
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
      this.connection = new Sequelize(databaseConfig);

      models.forEach((model) => model.init(this.connection));
      models.forEach((model) => {
        if (model.associate) {
          model.associate(this.connection.models);
        }
      });
    }
  }

  export default new Database();
