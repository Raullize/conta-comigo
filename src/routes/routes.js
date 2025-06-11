const { Router } = require('express');
const path = require('path');

const authMiddleware = require('../app/middlewares/authMiddleware');

const userController = require('../app/controllers/userController');
const sessionController = require('../app/controllers/sessionController');
const categoryController = require('../app/controllers/categoryController');
const accountController = require('../app/controllers/accountController');

const routes = new Router();

// Rotas públicas
routes.post('/users', userController.store);
routes.post('/sessions', sessionController.store);

// Tudo abaixo dessa rota vai trancar, tem que por token
routes.use(authMiddleware);

routes.get('/users', userController.show);
routes.put('/users', userController.update);
routes.delete('/users', userController.delete);
routes.post('/category', categoryController.createCategory);

routes.post('/account', accountController.createAccount);

module.exports = routes;
