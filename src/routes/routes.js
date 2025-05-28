const { Router } = require('express');
const userController = require('../app/controllers/UserController.js');

const routes = new Router();

// CRUD completo de usuários
routes.post('/users', userController.createUser); // Criar

module.exports = routes;
