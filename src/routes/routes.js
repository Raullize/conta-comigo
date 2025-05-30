const { Router } = require('express');

const userController = require('../app/controllers/UserController');
const sessionController = require('../app/controllers/sessionController');
const categoryController = require('../app/controllers/categoryController');

const routes = new Router();

routes.post('/users', userController.store);
routes.post('/sessions', sessionController.store);

routes.post('/category', categoryController.createCategory);

module.exports = routes;
