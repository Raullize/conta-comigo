

module.exports = {
  development: {
    username: process.env.CONTA_COMIGO_DB_USER,
    password: process.env.CONTA_COMIGO_DB_PASSWORD,
    database: process.env.CONTA_COMIGO_DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres'
  },

};
