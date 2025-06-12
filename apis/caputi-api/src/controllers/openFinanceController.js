import { Op } from 'sequelize';
import { User, Conta, Transacao as Transaction, Instituicao } from '../models/associations.js';

class OpenFinanceController {
  
  async getDataAccount(req, res) {
    try {
      const { cpf } = req.params;
      const institutionId = 1; 

      const user = await User.findOne({ where: { cpf } });
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      const institution = await Instituicao.findOne({ where: { id: institutionId } });
      if (!institution) {
        return res.status(404).json({ error: 'Instituição parceira não encontrada.' });
      }

      
      const account = await Conta.findOne({
        where: { 
          usuario_id: user.id, 
          instituicao_id: institution.id 
        },
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
            { conta_id: account.id_conta },
            { conta_destino_id: account.id_conta },
          ],
        },
        limit: 20,
        order: [['createdAt', 'DESC']], 
      });

      
      return res.json({
        idBank: institution.id,
        cpf: user.cpf,
        institution: institution.nome, 
        balance: account.saldo,     
        transactions: transactions.map(t => ({
          id: t.id,
          date: t.createdAt, 
          description: t.descricao,
          value: t.valor, 
          type: t.tipo,
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

      if (typeof consent !== 'boolean') {
        return res.status(400).json({ error: 'O valor de "consent" deve ser true ou false.' });
      }

      const user = await User.findOne({ where: { cpf } });
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
      
      
      const account = await Conta.findOne({
        where: {
          usuario_id: user.id,
          instituicao_id: institutionId,
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
        institution_id: account.instituicao_id,
        consent: account.consent,
      });

    } catch (error) {
      console.error('Erro ao atualizar consentimento:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
}

export default new OpenFinanceController();