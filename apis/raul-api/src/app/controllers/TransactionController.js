import { Op } from 'sequelize';
import * as Yup from 'yup';
import BankAccount from '../models/BankAccount';
import Transaction from '../models/Transaction';

class TransactionController {
  async index(req, res) {
    const { account_id } = req.params;
    const { page = 1, limit = 20, start_date, end_date, type, category } = req.query;

    const account = await BankAccount.findOne({
      where: {
        id: account_id,
        user_id: req.userId,
      },
    });

    if (!account) {
      return res.status(404).json({ error: 'Conta bancária não encontrada.' });
    }

    const where = { account_id };

    if (start_date && end_date) {
      where.transaction_date = {
        [Op.between]: [new Date(start_date), new Date(end_date)],
      };
    } else if (start_date) {
      where.transaction_date = {
        [Op.gte]: new Date(start_date),
      };
    } else if (end_date) {
      where.transaction_date = {
        [Op.lte]: new Date(end_date),
      };
    }

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    const transactions = await Transaction.findAll({
      where,
      limit: parseInt(limit, 10),
      offset: (page - 1) * limit,
      order: [['transaction_date', 'DESC']],
      attributes: ['id', 'description', 'amount', 'type', 'transaction_date', 'category'],
    });

    const count = await Transaction.count({ where });

    if (count === 0) {
      return res.json({
        transactions: [],
        total: 0,
        page: parseInt(page, 10),
        pages: 0,
        message: 'Nenhuma transação encontrada para esta conta bancária.',
      });
    }

    return res.json({
      transactions,
      total: count,
      page: parseInt(page, 10),
      pages: Math.ceil(count / limit),
    });
  }

  async getAllTransactions(req, res) {
    const { page = 1, limit = 20, start_date, end_date, type, category, bank_name } = req.query;

    try {
      const userAccounts = await BankAccount.findAll({
        where: { user_id: req.userId },
        attributes: ['id', 'bank_name'],
      });

      if (userAccounts.length === 0) {
        return res.json({
          transactions: [],
          total: 0,
          page: parseInt(page, 10),
          pages: 0,
          message: 'Usuário não possui contas bancárias',
        });
      }

      let accountsToUse = userAccounts;
      if (bank_name) {
        accountsToUse = userAccounts.filter((account) =>
          account.bank_name.toLowerCase().includes(bank_name.toLowerCase())
        );

        if (accountsToUse.length === 0) {
          return res.json({
            transactions: [],
            total: 0,
            page: parseInt(page, 10),
            pages: 0,
            message: `Nenhuma conta encontrada para o banco ${bank_name}`,
          });
        }
      }

      const accountIds = accountsToUse.map((account) => account.id);

      const where = {
        account_id: {
          [Op.in]: accountIds,
        },
      };

      if (start_date && end_date) {
        where.transaction_date = {
          [Op.between]: [new Date(start_date), new Date(end_date)],
        };
      } else if (start_date) {
        where.transaction_date = {
          [Op.gte]: new Date(start_date),
        };
      } else if (end_date) {
        where.transaction_date = {
          [Op.lte]: new Date(end_date),
        };
      }

      if (type) {
        where.type = type;
      }

      if (category) {
        where.category = category;
      }

      const transactions = await Transaction.findAll({
        where,
        limit: parseInt(limit, 10),
        offset: (page - 1) * limit,
        order: [['transaction_date', 'DESC']],
        attributes: ['id', 'description', 'amount', 'type', 'transaction_date', 'category'],
        include: [
          {
            model: BankAccount,
            as: 'account',
            attributes: ['id', 'bank_name', 'agency', 'account_number'],
          },
        ],
      });

      const count = await Transaction.count({ where });

      if (count === 0) {
        let message = 'Nenhuma transação encontrada';

        if (type && category) {
          message += ` do tipo "${type}" na categoria "${category}"`;
        } else if (type) {
          message += ` do tipo "${type}"`;
        } else if (category) {
          message += ` na categoria "${category}"`;
        }

        if (start_date && end_date) {
          message += ` no período de ${start_date} a ${end_date}`;
        } else if (start_date) {
          message += ` a partir de ${start_date}`;
        } else if (end_date) {
          message += ` até ${end_date}`;
        }

        return res.json({
          transactions: [],
          total: 0,
          page: parseInt(page, 10),
          pages: 0,
          message,
        });
      }

      return res.json({
        transactions,
        total: count,
        page: parseInt(page, 10),
        pages: Math.ceil(count / limit),
      });
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      return res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
    }
  }

  async show(req, res) {
    const transaction = await Transaction.findByPk(req.params.id, {
      attributes: ['id', 'description', 'amount', 'type', 'transaction_date', 'category'],
      include: [
        {
          model: BankAccount,
          as: 'account',
          attributes: ['id', 'bank_name', 'agency', 'account_number'],
          where: { user_id: req.userId },
        },
      ],
    });

    if (!transaction) {
      return res
        .status(404)
        .json({ error: 'Transação não encontrada ou não pertence ao usuário.' });
    }

    return res.json(transaction);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
      amount: Yup.number().required(),
      type: Yup.string().required().oneOf(['deposit', 'withdrawal', 'transfer']),
      category: Yup.string().required(),
      transaction_date: Yup.date().default(() => new Date()),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação.' });
    }

    const { account_id } = req.params;

    const account = await BankAccount.findOne({
      where: {
        id: account_id,
        user_id: req.userId,
      },
    });

    if (!account) {
      return res.status(404).json({ error: 'Conta bancária não encontrada.' });
    }

    const transaction = await Transaction.create({
      ...req.body,
      account_id,
    });

    let newBalance = parseFloat(account.balance);
    if (req.body.type === 'deposit') {
      newBalance += parseFloat(req.body.amount);
    } else if (req.body.type === 'withdrawal' || req.body.type === 'transfer') {
      newBalance -= parseFloat(req.body.amount);
    }

    await account.update({ balance: newBalance });

    return res.json(transaction);
  }
}

export default new TransactionController();
