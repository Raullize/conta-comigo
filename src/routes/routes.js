const { Router } = require('express');
const path = require('path');

const authMiddleware = require('../app/middlewares/auth');

const userController = require('../app/controllers/userController');
const sessionController = require('../app/controllers/sessionController');
const categoryController = require('../app/controllers/categoryController');

const routes = new Router();

// Rotas públicas
routes.post('/users', userController.store);
routes.post('/sessions', sessionController.store);

// Tudo abaixo dessa rota vai trancar, tem que por token
routes.use(authMiddleware);

routes.get('/users', userController.show);
routes.put('/users', userController.update);
routes.post('/category', categoryController.createCategory);

module.exports = routes;
