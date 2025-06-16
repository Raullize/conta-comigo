import User from '../models/User.js';
import Account from '../models/BankAccount.js';
import Transaction from '../models/Transaction.js';
import Institution from '../models/Institution.js';

class UserController {
  async store(req, res) {
    try {
      const { cpf, name } = req.body;

      if (!cpf || !name) {
        return res.status(400).json({ error: 'CPF and name are required' });
      }

      // Verificar se o usuário já existe
      const existingUser = await User.findOne({ where: { cpf } });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const user = await User.create({ cpf, name });

      return res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async index(req, res) {
    try {
    const users = await User.findAll({
        order: [['created_at', 'DESC']]
    });

    return res.json(users);
    } catch (error) {
      console.error('Error listing users:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async show(req, res) {
    try {
      const { cpf } = req.params;

      const user = await User.findOne({
        where: { cpf },
        include: [
          {
            association: 'accounts',
            include: ['institution', 'transactions']
          }
        ]
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Calcular total balance para compatibilidade com Open Finance
      const totalBalance = user.accounts.reduce((sum, account) => {
        return sum + parseFloat(account.balance || 0);
      }, 0);

      // Formatar dados no padrão esperado pelo Open Finance
      const userData = {
        cpf: user.cpf,
        name: user.name,
        total_balance: totalBalance,
        balance: totalBalance, // Alias para compatibilidade
        accounts: user.accounts,
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      return res.json(userData);
    } catch (error) {
      console.error('Error showing user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTotalBalance(req, res) {
    try {
      const { cpf } = req.params;

      const user = await User.findOne({ where: { cpf } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

      const accounts = await Account.findAll({
        where: { user_cpf: cpf },
        include: ['institution']
      });

      const totalBalance = accounts.reduce((sum, account) => {
        return sum + parseFloat(account.balance || 0);
      }, 0);

      return res.json({
        user: user.name,
        total_balance: totalBalance,
        institutions: accounts.map(account => account.institution)
      });
    } catch (error) {
      console.error('Error getting total balance:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getStatement(req, res) {
    try {
      const { cpf } = req.params;

      const user = await User.findOne({ where: { cpf } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const accounts = await Account.findAll({
        where: { user_cpf: cpf },
        include: [
          'institution',
          {
            association: 'transactions',
            order: [['created_at', 'DESC']]
          }
        ]
      });

      const allTransactions = accounts.reduce((transactions, account) => {
        const accountTransactions = account.transactions.map(transaction => ({
          ...transaction.toJSON(),
          institution: account.institution.name
        }));
        return [...transactions, ...accountTransactions];
      }, []);

      // Ordenar todas as transações por data
      allTransactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.json({
        user: user.name,
        transactions: allTransactions
      });
    } catch (error) {
      console.error('Error getting statement:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new UserController();
