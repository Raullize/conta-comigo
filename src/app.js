const express = require('express');
const path = require('path');
const routes = require('./routes/routes.js');

class App {
  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    
    this.server.use(express.json());

    
    this.server.use(express.static(path.join(__dirname, '..', 'public')));
  }

  routes() {
    
    this.server.use(routes);

    
    this.server.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
    });

    
    this.server.get('/pages/:page', (req, res) => {
      const page = req.params.page;
      res.sendFile(path.join(__dirname, '..', 'public', 'pages', page));
    });

    
    this.server.use((req, res, next) => {
    
      if (!req.path.includes('.') && req.path !== '/') {
        return res.status(404).json({ error: 'Rota não encontrada' });
      }

    
      res.redirect('/');
    });

    
    this.server.use((error, req, res, next) => {
      console.error('Erro interno:', error);

    
      if (!req.path.includes('.') && req.path !== '/') {
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

    
      res.redirect('/');
    });
  }
}

module.exports = new App().server;
