import express from 'express';
import routes from './routes.js';

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
    this.server.use(routes);
    this.server.use((req, res) => {
        res.status(404).json({ error: 'Route Not Found' });
    });
    this.server.use((err, req, res, next) => {
        // eslint-disable-next-line
        console.error(err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    });
    }
}
export default new App().server;