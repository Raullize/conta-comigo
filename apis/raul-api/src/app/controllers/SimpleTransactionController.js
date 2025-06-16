import Transaction from '../models/Transaction.js';
import Account from '../models/BankAccount.js';
import User from '../models/User.js';

class SimpleTransactionController {
  async store(req, res) {
    try {
      const { cpf } = req.params;
      const { institution_id, description, type, value, account_id } = req.body;

      // Verificar se o usuário existe
      const user = await User.findOne({ where: { cpf } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      let account;

      if (account_id) {
        // Se account_id foi fornecido, usar ele
        account = await Account.findByPk(account_id);
        if (!account || account.user_cpf !== cpf) {
          return res.status(404).json({ error: 'Account not found or not owned by user' });
        }
      } else if (institution_id) {
        // Se não foi fornecido account_id, buscar pela instituição
        account = await Account.findOne({
          where: { 
            user_cpf: cpf,
            institution_id: institution_id
          }
        });
        
        if (!account) {
          return res.status(404).json({ error: 'Account not found for this institution' });
        }
      } else {
        return res.status(400).json({ error: 'Either account_id or institution_id is required' });
      }

      // Validar campos obrigatórios
      if (!description || !type || !value) {
        return res.status(400).json({ error: 'Description, type and value are required' });
      }

      // Validar tipo de transação
      if (!['entrada', 'saida'].includes(type)) {
        return res.status(400).json({ error: 'Type must be "entrada" or "saida"' });
      }

      // Criar a transação
      const transaction = await Transaction.create({
        account_id: account.id,
        description,
        type,
        value: parseFloat(value)
      });

      // Atualizar saldo da conta
      const newBalance = type === 'entrada' 
        ? parseFloat(account.balance) + parseFloat(value)
        : parseFloat(account.balance) - parseFloat(value);

      await account.update({ balance: newBalance });

      // Retornar transação com informações da conta
      const transactionWithAccount = await Transaction.findByPk(transaction.id, {
        include: {
          association: 'account',
          include: ['institution', 'user']
        }
      });

      return res.status(201).json(transactionWithAccount);
    } catch (error) {
      console.error('Error creating transaction:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async index(req, res) {
    try {
      const { cpf } = req.params;

      // Verificar se o usuário existe
      const user = await User.findOne({ where: { cpf } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Buscar todas as contas do usuário
      const accounts = await Account.findAll({
        where: { user_cpf: cpf }
      });

      const accountIds = accounts.map(account => account.id);

      // Buscar todas as transações das contas do usuário
      const transactions = await Transaction.findAll({
        where: { account_id: accountIds },
        include: {
          association: 'account',
          include: ['institution']
        },
        order: [['created_at', 'DESC']]
      });

      return res.json({ transactions });
    } catch (error) {
      console.error('Error listing transactions:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new SimpleTransactionController(); 