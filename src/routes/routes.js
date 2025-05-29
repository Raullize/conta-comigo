const { Router } = require('express');

const userController = require('../app/controllers/UserController.js');

const routes = new Router();

routes.post('/users', userController.store);

module.exports = routes;
