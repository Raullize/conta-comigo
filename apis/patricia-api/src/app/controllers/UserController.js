import User from './models/User.js';

class UserController {
  async store(req, res) {
    try {
      const { cpf, name, email } = req.body;

      // Verifica se usuário já existe
      const userExists = await User.findByPk(cpf);
      if (userExists) {
        return res.status(409).json({ error: 'Esse CPF já está cadastrado' });
      }

      const newUser = await User.create({ cpf, name, email });
      return res.status(201).json(newUser);

    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }

  async index(req, res) {
    try {
      const users = await User.findAll();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
  }

  async show(req, res) {
    try {
      const { cpf } = req.params;
      const user = await User.findByPk(cpf);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  }

  async update(req, res) {
    try {
      const { cpf } = req.params;
      const { name, email } = req.body;
      const user = await User.findByPk(cpf);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      await user.update({ name, email });
      return res.status(200).json(user);

    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
  }

  async delete(req, res) {
    try {
      const { cpf } = req.params;
      const user = await User.findByPk(cpf);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      await user.destroy();
      return res.status(204).send();

    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
  }
}

export default new UserController();
