// src/app/controllers/UserController.js
// Importa a instância da classe Database que já inicializou a conexão e os modelos.
const database = require('../../database');

class UserController {
  async createUser(req, res) {
    try {
      const User = database.connection.models.User;
      const create = await User.create(req.body);
      res
        .status(201)
        .json({ message: 'Usuário criado com sucesso!', user: create });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(400).json({
        message: 'Ocorreu um erro ao criar o usuário.',
        details: error.message,
        validationErrors:
          error.name === 'SequelizeValidationError' ? error.errors : undefined,
      });
    }
  }
}

module.exports = new UserController();
