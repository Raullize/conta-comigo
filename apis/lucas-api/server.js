const express = require('express');
const app = express();
const InstituicaoRoutes = require('./src/routes/instituicaoRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes');
const contaRoutes = require('./src/routes/contaRoutes');
const transacaoRoutes = require('./src/routes/transacaoRoutes')
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(InstituicaoRoutes);
app.use(usuarioRoutes);
app.use(contaRoutes);
app.use(transacaoRoutes);

app.listen(port, () => {
    console.log(`O servidor está rodando na porta: ${port}`);
});