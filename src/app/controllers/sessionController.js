const jwt = require('jsonwebtoken');
const {
  models: { User },
} = require('../../database');
const authValidators = require('../validators/authConfig');

class sessionController {
  async store(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      if (!(await user.checkPassword(password))) {
        return res.status(401).json({ error: 'Senha incorreta' });
      }

      const { id, name, cpf, birth_date } = user;

      return res.json({
        user: {
          id,
          name,
          email,
          cpf,
          birth_date,
        },
        token: jwt.sign({ id }, authValidators.secret, {
          expiresIn: authValidators.expiresIn,
        }),
      });
    } catch (error) {
      console.error('Falha no login:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new sessionController();
