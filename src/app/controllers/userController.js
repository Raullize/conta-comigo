const { models } = require('../../database');
const User = models.User;

class userController {
  async store(req, res) {
    try {
      const { name, cpf, email, birth_date, password } = req.body;

      // Verificar se o usuário já existe por e-mail
      const userExistsByEmail = await User.findOne({
        where: { email },
      });

      if (userExistsByEmail) {
        return res.status(400).json({ error: 'Usuário já existe com este e-mail.' });
      }

      // Verificar se o usuário já existe por CPF
      const userExistsByCpf = await User.findOne({
        where: { cpf },
      });

      if (userExistsByCpf) {
        return res.status(400).json({ error: 'Usuário já existe com este CPF.' });
      }

      // Criar o usuário
      const user = await User.create({
        name,
        cpf,
        email,
        birth_date,
        password,
      });

      return res.status(201).json({
        id: user.id,
        name: user.name,
        cpf: user.cpf,
        email: user.email,
        birth_date: user.birth_date,
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  async show(req, res) {
    try {
      const user = await User.findByPk(req.userId, {
        attributes: ['id', 'name', 'cpf', 'email', 'birth_date'],
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      return res.json(user);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  async update(req, res) {
    try {
      const { name, email, oldPassword } = req.body;

      const user = await User.findByPk(req.userId);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      if (email && email !== user.email) {
        const userExists = await User.findOne({
          where: { email },
        });

        if (userExists) {
          return res.status(400).json({ error: 'E-mail já está em uso.' });
        }
      }

      if (oldPassword && !(await user.checkPassword(oldPassword))) {
        return res.status(401).json({ error: 'Senha atual incorreta.' });
      }

      const updatedUser = await user.update(req.body);

      return res.json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
}

module.exports = new userController();
