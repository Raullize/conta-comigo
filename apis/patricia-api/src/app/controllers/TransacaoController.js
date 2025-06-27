import Transacao from '../controllers/models/Transacao.js';
import Conta from '../controllers/models/Conta.js';
import Instituicao from './models/Instituicao.js';
import User from './models/User.js';

class TransacaoController {
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
        account = await Conta.findByPk(account_id);
        if (!account || account.user_cpf !== cpf) {
          return res.status(404).json({ error: 'Account not found or not owned by user' });
        }
      } else if (institution_id) {
        // Se não foi fornecido account_id, buscar pela instituição
        account = await Conta.findOne({
          where: { 
            user_cpf: cpf,
            instituicao_id: institution_id
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
      const transaction = await Transacao.create({
        conta_id: account.id,
        descricao: description,
        tipo: type,
        valor: parseFloat(value),
        data: new Date()
          });

    // Atualizar saldo da conta
      const newBalance = type === 'entrada' 
        ? parseFloat(account.balance) + parseFloat(value)
        : parseFloat(account.balance) - parseFloat(value);

      await account.update({ balance: newBalance });

      return res.status(201).json({
        id: transaction.id,
        descricao: transaction.descricao,
        tipo: transaction.tipo,
        valor: transaction.valor,
        data: transaction.data,
        conta_id: transaction.conta_id,
        new_balance: newBalance
      });

    } catch (error) {
      console.error('Error creating transaction:', error);
      return res.status(500).json({ 
        error: 'Internal server error', 
        details: error.message 
      });
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
      const accounts = await Conta.findAll({
        where: { user_cpf: cpf }
      });

      const accountIds = accounts.map(account => account.id);

      // Buscar todas as transações das contas do usuário
      const transactions = await Transacao.findAll({
        where: { conta_id: accountIds },
        order: [['created_at', 'DESC']]
      });

      return res.json({ transactions });
    } catch (error) {
      console.error('Error listing transactions:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;
      const transacao = await Transacao.findByPk(id, {
        include: [{ model: Conta, as: 'conta' }]
      });

      if (!transacao) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      return res.status(200).json(transacao);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar transação' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { descricao, tipo, valor, data } = req.body;

      const transacao = await Transacao.findByPk(id);
      if (!transacao) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      await transacao.update({ descricao, tipo, valor, data });
      return res.status(200).json(transacao);

    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar transação' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const transacao = await Transacao.findByPk(id);

      if (!transacao) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      await transacao.destroy();
      return res.status(204).send();

    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar transação' });
    }
  }
}

export default new TransacaoController();
