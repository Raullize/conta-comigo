const { Router } = require('express');

const userController = require('../app/controllers/UserController');
const sessionController = require('../app/controllers/sessionController');

const routes = new Router();

routes.post('/users', userController.store);
routes.post('/sessions', sessionController.store);

module.exports = routes;
