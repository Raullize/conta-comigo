const { Router } = require('express');

const userController = require('../app/controllers/userController');
const sessionController = require('../app/controllers/sessionController');
const categoryController = require('../app/controllers/categoryController');
const accountController = require('../app/controllers/accountController');

const routes = new Router();

routes.post('/users', userController.store);
routes.post('/sessions', sessionController.store);

routes.post('/category', categoryController.createCategory);

routes.post('/account', accountController.createAccount);

module.exports = routes;
