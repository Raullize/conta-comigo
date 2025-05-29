const { Router } = require('express');

const userController = require.path('../app/controllers/UserController');

const routes = new Router();

routes.post('/users', userController.store);

module.exports = routes;
