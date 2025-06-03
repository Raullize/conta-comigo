const express = require("express");
const rotas = require('./rotas');

const app = express();
app.use(express.json());

app.use('/', rotas);

if (require.main === module) {
  const DockerPort = process.env.PORT || 3002; 
  const port = 4002;
  app.listen(DockerPort, async () => { 
    console.log(`dante-api server running at http://localhost:${port}/`);
  });
}

module.exports = app;