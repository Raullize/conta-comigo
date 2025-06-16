import Account from '../models/BankAccount.js';
import User from '../models/User.js';
import Institution from '../models/Institution.js';

class AccountController {
  async store(req, res) {
    try {
      const { cpf } = req.params;
      const { balance, institution_id, consent } = req.body;

      // Verificar se o usuário existe
      const user = await User.findOne({ where: { cpf } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verificar se a instituição existe
      const institution = await Institution.findByPk(institution_id);
      if (!institution) {
        return res.status(404).json({ error: 'Institution not found' });
      }

      // Verificar se já existe uma conta para este usuário e instituição
      const existingAccount = await Account.findOne({
        where: { 
          user_cpf: cpf,
          institution_id: institution_id
        }
      });

      if (existingAccount) {
        return res.status(400).json({ error: 'Account already exists for this user and institution' });
      }

      const account = await Account.create({
        user_cpf: cpf,
        institution_id,
        balance: balance || 0,
        consent: consent || false
      });

      // Retornar conta com informações da instituição
      const accountWithInstitution = await Account.findByPk(account.id, {
        include: ['institution', 'user']
      });

      return res.status(201).json(accountWithInstitution);
    } catch (error) {
      console.error('Error creating account:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async index(req, res) {
    try {
      const { cpf } = req.params;

      if (cpf) {
        // Listar contas de um usuário específico
        const accounts = await Account.findAll({
          where: { user_cpf: cpf },
          include: ['institution', 'user'],
          order: [['created_at', 'DESC']]
        });

        return res.json(accounts);
      } else {
        // Listar todas as contas
        const accounts = await Account.findAll({
          include: ['institution', 'user'],
          order: [['created_at', 'DESC']]
        });

        return res.json(accounts);
      }
    } catch (error) {
      console.error('Error listing accounts:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new AccountController(); 