require("dotenv").config();
const express = require("express");
const pool = require('./bd')
const rotas = require('./rotas');

const app = express();
app.use(express.json());

app.use('/', rotas)

if (require.main === module) {
    const PORT = 3000
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  }
  
module.exports = app;