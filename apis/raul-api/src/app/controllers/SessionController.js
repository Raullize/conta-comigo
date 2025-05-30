import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import BankAccount from '../models/BankAccount';
import User from '../models/User';

import authConfig from '../../config/auth';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação.' });
    }

    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: BankAccount,
          as: 'accounts',
          attributes: ['id', 'bank_name', 'account_type', 'balance'],
          where: { is_active: true },
          required: false,
        },
      ],
    });
    if (!user) {
      return res.status(401).json({ error: 'Usuário não existe.' });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Senha incorreta.' });
    }

    const { id, name, cpf, accounts } = user;

    return res.json({
      user: {
        id,
        name,
        email,
        cpf,
        accounts_count: accounts ? accounts.length : 0,
        has_accounts: accounts && accounts.length > 0,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
