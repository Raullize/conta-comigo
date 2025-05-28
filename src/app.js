const express = require('express');
const routes = require ('./routes/routes.js');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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

// Security middleware
app.use(helmet());
app.use(cors());
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes will be added here
// app.use('/api', require('./routes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default new App().server; 