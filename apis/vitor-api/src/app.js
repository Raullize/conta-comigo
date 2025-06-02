import express from "express";
import router from "./routes/routes.js";

import "./database/index.js";

class App {
  constructor() {
    this.server = express();

    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(express.json());
  }

  routes() {
    this.server.use(router);
  }
}

export default new App().server;
