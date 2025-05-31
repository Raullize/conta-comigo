const express = require('express');
const path = require('path');
const routes = require('./routes/routes.js');
require('dotenv').config();

class App {
  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    // Middleware para processar JSON
    this.server.use(express.json());

    // Servir arquivos estáticos da pasta public
    this.server.use(express.static(path.join(__dirname, '..', 'public')));
  }

  routes() {
    // Rotas da API
    this.server.use(routes);

    // Rota para a página principal
    this.server.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
    });

    // Rota para as páginas HTML
    this.server.get('/pages/:page', (req, res) => {
      const page = req.params.page;
      res.sendFile(path.join(__dirname, '..', 'public', 'pages', page));
    });

    // Middleware de tratamento de erros 404
    this.server.use((req, res, next) => {
      // Se a rota for uma API (não for arquivo estático), retornar JSON
      if (!req.path.includes('.') && req.path !== '/') {
        return res.status(404).json({ error: 'Rota não encontrada' });
      }

      // Para outras rotas, redirecionar para a página principal
      res.redirect('/');
    });

    // Middleware de tratamento de erros 500
    this.server.use((error, req, res, next) => {
      console.error('Erro interno:', error);

      // Se a rota for uma API (não for arquivo estático), retornar JSON
      if (!req.path.includes('.') && req.path !== '/') {
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      // Para outras rotas, redirecionar para a página principal
      res.redirect('/');
    });
  }
}

module.exports = new App().server;
