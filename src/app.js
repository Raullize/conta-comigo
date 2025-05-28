const express = require('express');
const routes = require('./routes/routes.js');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

class App {
  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(express.json());
    this.server.use(helmet());     
    this.server.use(compression());
  }

  routes() {
    this.server.use(routes);
    this.server.use((req, res) => {
      res.status(404).json({ error: 'Route Not Found' });

    });
    this.server.use((err, req, res, next) => {
      // eslint-disable-next-line
        console.error(err.stack);
      res.status(500).json({ error: 'Internal Server Error' });
    });

    this.server.use((err, req, res, next) => {
      res.status(500).json({ error: 'Internal Server Error' });
    });
  }
}

module.exports = new App().server;