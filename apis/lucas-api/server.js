const express = require('express');
const app = express();
const InstituicaoRoutes = require('./src/routes/instituicaoRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes');
const contaRoutes = require('./src/routes/contaRoutes');
const transacaoRoutes = require('./src/routes/transacaoRoutes')
const DockerPort = 3003;
const port = 4003;
app.use(express.json());
app.use(InstituicaoRoutes);
app.use(usuarioRoutes);
app.use(contaRoutes);
app.use(transacaoRoutes);

app.listen(DockerPort, () => {
    console.log(`lucas-api server running at http://localhost:${port}/`);
});