  import Sequelize from "sequelize";
  import databaseConfigObject from "../config/database.js";
  import User from '../app/controllers/models/User.js';
  import Instituicao from "../app/controllers/models/Instituicao.js";
  import Conta from "../app/controllers/models/Conta.js";
  import Transacao from "../app/controllers/models/Transacao.js";

  const models = [ User, Instituicao, Conta , Transacao ];
  class Database {
    constructor() {41+
      this.init();
    }
    init() {

    const env =  'development';
    
    const envConfig = databaseConfigObject[env];


    

    this.connection = new Sequelize(
      envConfig.database,
      envConfig.username,
      envConfig.password,
      envConfig
    );


    models.forEach((models) => models.init(this.connection));
    models.forEach((models) => {
      if (models.associate) {
        models.associate(this.connection.models);
      }
    });
  }
}

  export default new Database();
