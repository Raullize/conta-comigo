import * as Yup from 'yup';
import BankAccount from '../models/BankAccount';
import Transaction from '../models/Transaction';

class BankAccountController {
  async index(req, res) {
    const accounts = await BankAccount.findAll({
      where: { user_id: req.userId },
      attributes: [
        'id',
        'bank_name',
        'agency',
        'account_number',
        'account_type',
        'balance',
        'is_active',
      ],
    });

    if (accounts.length === 0) {
      return res.json({
        accounts: [],
        message: 'Você ainda não possui contas bancárias cadastradas.',
      });
    }

    return res.json(accounts);
  }

  async show(req, res) {
    const account = await BankAccount.findOne({
      where: {
        id: req.params.id,
        user_id: req.userId,
      },
      attributes: [
        'id',
        'bank_name',
        'agency',
        'account_number',
        'account_type',
        'balance',
        'is_active',
      ],
      include: [
        {
          model: Transaction,
          as: 'transactions',
          attributes: ['id', 'description', 'amount', 'type', 'transaction_date', 'category'],
          limit: 10,
          order: [['transaction_date', 'DESC']],
        },
      ],
    });

    if (!account) {
      return res.status(404).json({ error: 'Conta bancária não encontrada.' });
    }

    if (!account.transactions || account.transactions.length === 0) {
      return res.json({
        ...account.get(),
        transactions: [],
        message: 'Esta conta bancária ainda não possui transações.',
      });
    }

    return res.json(account);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      bank_name: Yup.string().required(),
      agency: Yup.string().required(),
      account_number: Yup.string().required(),
      account_type: Yup.string().required().oneOf(['checking', 'savings', 'investment']),
      balance: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação.' });
    }

    const accountExists = await BankAccount.findOne({
      where: {
        user_id: req.userId,
        bank_name: req.body.bank_name,
        agency: req.body.agency,
        account_number: req.body.account_number,
      },
    });

    if (accountExists) {
      return res.status(400).json({ error: 'Você já possui esta conta cadastrada.' });
    }

    const account = await BankAccount.create({
      ...req.body,
      user_id: req.userId,
      is_active: true,
    });

    return res.json(account);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      bank_name: Yup.string(),
      agency: Yup.string(),
      account_number: Yup.string(),
      account_type: Yup.string().oneOf(['checking', 'savings', 'investment']),
      balance: Yup.number(),
      is_active: Yup.boolean(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação.' });
    }

    const account = await BankAccount.findOne({
      where: {
        id: req.params.id,
        user_id: req.userId,
      },
    });

    if (!account) {
      return res.status(404).json({ error: 'Conta bancária não encontrada.' });
    }

    const updatedAccount = await account.update(req.body);

    return res.json(updatedAccount);
  }

  async delete(req, res) {
    const account = await BankAccount.findOne({
      where: {
        id: req.params.id,
        user_id: req.userId,
      },
    });

    if (!account) {
      return res.status(404).json({ error: 'Conta bancária não encontrada.' });
    }

    await account.update({ is_active: false });

    return res.json({ message: 'Conta bancária desativada com sucesso.' });
  }
}

export default new BankAccountController();
