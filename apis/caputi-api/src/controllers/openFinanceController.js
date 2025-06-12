

import { Op } from 'sequelize';
import User from '../models/User.js';
import BankAccount from '../models/Conta.js';
import Transaction from '../models/Transacao.js';
import Institution from '../models/Institution.js';

class OpenFinanceController {
  
  async getDataAccount(req, res) {
    try {
      const { cpf } = req.params;
      const institutionId = 1;

      const user = await User.findOne({ where: { cpf } });
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      const institution = await Institution.findOne({ where: { id: institutionId } });
      if (!institution) {
        return res.status(404).json({ error: 'Instituição parceira não encontrada.' });
      }

      const account = await BankAccount.findOne({
        where: { user_id: user.id, institution_id: institution.id },
      });

      if (!account) {
        return res.status(404).json({ error: 'Conta não encontrada para este usuário e instituição.' });
      }

      if (!account.consent) {
        return res.status(403).json({ error: 'Consentimento para compartilhamento de dados não foi fornecido para esta conta.' });
      }

      const transactions = await Transaction.findAll({
        where: {
          [Op.or]: [
            { origin_account_id: account.id },
            { destination_account_id: account.id },
          ],
        },
        limit: 20,
        order: [['transaction_date', 'DESC']],
      });

      return res.json({
        idBank: institution.id,
        cpf: user.cpf,
        institution: institution.name,
        balance: account.balance,
        transactions: transactions.map(t => ({
          id: t.id,
          date: t.transaction_date,
          description: t.description,
          value: t.amount,
          type: t.type,
          category: t.category,
        })),
      });

    } catch (error) {
      console.error('Erro ao buscar dados da conta via Open Finance:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  async updateConsent(req, res) {
    try {
      const { cpf } = req.params;
      const { consent } = req.body;
      const institutionId = 1;

    
    
      if (consent === undefined || consent === null) {
        return res.status(400).json({ error: 'O campo "consent" é obrigatório.' });
      }

    
      if (typeof consent !== 'boolean') {
        return res.status(400).json({ error: 'O valor de "consent" deve ser do tipo booleano (true ou false).' });
      }
    

      const user = await User.findOne({ where: { cpf } });
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
      
      const account = await BankAccount.findOne({
        where: {
          user_id: user.id,
          institution_id: institutionId,
        },
      });

      if (!account) {
        return res.status(404).json({ error: 'Conta não encontrada para este usuário e instituição.' });
      }

      account.consent = consent;
      await account.save();

      return res.json({
        message: 'Consentimento atualizado com sucesso.',
        cpf: user.cpf,
        institution_id: account.institution_id,
        consent: account.consent,
      });

    } catch (error) {
      console.error('Erro ao atualizar consentimento:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
}

export default new OpenFinanceController();