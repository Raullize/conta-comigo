require("dotenv").config();
const express = require("express");
const rotas = require('./rotas');

const app = express();
app.use(express.json());

app.use('/', rotas)

if (require.main === module) {
    const DockerPort = 3002
    app.listen(DockerPort, () => console.log(`Servidor rodando na porta ${DockerPort}`));
  }
  
module.exports = app;