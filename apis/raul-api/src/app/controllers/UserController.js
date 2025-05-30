import * as Yup from 'yup';
import BankAccount from '../models/BankAccount';
import User from '../models/User';

class UserController {
  async index(req, res) {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'cpf'],
    });

    if (users.length === 0) {
      return res.json({
        users: [],
        message: 'Nenhum usuário cadastrado no sistema.',
      });
    }

    return res.json(users);
  }

  async show(req, res) {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email', 'cpf'],
      include: [
        {
          model: BankAccount,
          as: 'accounts',
          attributes: ['id', 'bank_name', 'agency', 'account_number', 'account_type', 'balance'],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (!user.accounts || user.accounts.length === 0) {
      return res.json({
        ...user.get(),
        accounts: [],
        message: 'Este usuário não possui contas bancárias cadastradas.',
      });
    }

    return res.json(user);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      cpf: Yup.string().required().length(11),
      password: Yup.string().required().min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação.' });
    }

    const userExists = await User.findOne({
      where: { email: req.body.email },
    });

    if (userExists) {
      return res.status(400).json({ error: 'Usuário já existe.' });
    }

    const cpfExists = await User.findOne({
      where: { cpf: req.body.cpf },
    });

    if (cpfExists) {
      return res.status(400).json({ error: 'CPF já cadastrado.' });
    }

    const { id, name, email, cpf } = await User.create(req.body);

    return res.json({
      id,
      name,
      email,
      cpf,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      cpf: Yup.string().length(11),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) => (oldPassword ? field.required() : field)),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação.' });
    }

    const { email, cpf, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (email !== user.email) {
      const userExists = await User.findOne({
        where: { email },
      });

      if (userExists) {
        return res.status(400).json({ error: 'Usuário já existe.' });
      }
    }

    if (cpf && cpf !== user.cpf) {
      const cpfExists = await User.findOne({
        where: { cpf },
      });

      if (cpfExists) {
        return res.status(400).json({ error: 'CPF já cadastrado.' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Senha incorreta.' });
    }

    const { id, name } = await user.update(req.body);

    return res.json({
      id,
      name,
      email: email || user.email,
      cpf: cpf || user.cpf,
    });
  }
}

export default new UserController();
