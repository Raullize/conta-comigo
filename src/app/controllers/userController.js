const { models } = require('../../database');
const User = models.User;

class userController {
  async store(req, res) {
    try {
      const { name, cpf, email, birth_date, password } = req.body;

      const cleanCpf = cpf.replace(/[.-]/g, '');

      const userExistsByEmail = await User.findOne({
        where: { email },
      });

      if (userExistsByEmail) {
        return res.status(400).json({ error: 'The user already exists' });
      }

      const userExistsByCpf = await User.findOne({
        where: { cpf: cleanCpf },
      });

      if (userExistsByCpf) {
        return res.status(400).json({ error: 'This CPF already exists' });
      }

      const user = await User.create({
        name,
        cpf: cleanCpf,
        email,
        birthDate: birth_date,
        password,
      });

      return res.status(201).json({
        id: user.id,
        name: user.name,
        cpf: user.cpf,
        email: user.email,
        birth_date: user.birth_date,
        created_at: user.created_at,
        updated_at: user.updated_at
      });
    } catch (error) {
      console.error("Error we can't creat user", error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async show(req, res) {
    try {
      const user = await User.findByPk(req.userId, {
        attributes: ['id', 'name', 'cpf', 'email', 'birth_date'],
      });

      if (!user) {
        return res.status(404).json({ error: 'User not find.' });
      }

      return res.json(user);
    } catch (error) {
      console.error("Error, we can't find the user. ", error);
      return res.status(500).json({ error: 'Internal Server Error.' });
    }
  }

  async update(req, res) {
    try {
      const { name, email, birthDate, oldPassword, password } = req.body;

      const user = await User.findByPk(req.userId);

      if (!user) {
        return res.status(404).json({ error: 'User not find.' });
      }

      if (email && email !== user.email) {
        const userExists = await User.findOne({
          where: { email },
        });

        if (userExists) {
          return res.status(400).json({ error: 'E-mail already exists.' });
        }
      }

      if (oldPassword && !(await user.checkPassword(oldPassword))) {
        return res.status(401).json({ error: 'Old Password incorrect.' });
      }

      const updateData = { name, email };
      if (birthDate) {
        updateData.birthDate = birthDate;
      }
      
      if (password) {
        updateData.password = password;
      }

      const updatedUser = await user.update(updateData);

      return res.json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        cpf: updatedUser.cpf,
        birth_date: updatedUser.birth_date,
      });
    } catch (error) {
      console.error('Error not updated:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async delete(req, res) {
    try {
      const user = await User.findByPk(req.userId);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      await user.destroy();

      return res.status(200).json({ message: 'Conta deletada com sucesso.' });
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new userController();
