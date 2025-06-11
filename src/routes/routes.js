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

// Rotas autenticadas
routes.use(authMiddleware);

routes.get('/users', userController.show);
routes.put('/users', userController.update);
routes.post('/category', categoryController.createCategory);

routes.get('/open-finance/:idBank', accountController.createAccount);

module.exports = routes;
