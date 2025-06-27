import Conta from '../controllers/models/Conta.js';
import Transacao from '../controllers/models/Transacao.js';
import Instituicao from './models/Instituicao.js';
import User from './models/User.js';

class ContaController {
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
      const institution = await Instituicao.findByPk(institution_id);
      if (!institution) {
        return res.status(404).json({ error: 'Institution not found' });
      }

      // Verificar se já existe uma conta para este usuário e instituição
      const existingAccount = await Conta.findOne({
        where: { 
          user_cpf: cpf,
          instituicao_id: institution_id
        }
      });

      if (existingAccount) {
        return res.status(400).json({ error: 'Account already exists for this user and institution' });
      }

      const account = await Conta.create({
        user_cpf: cpf,
        instituicao_id: institution_id,
        balance: balance || 0,
        consent: consent || false
      });

      // Retornar conta com informações da instituição
      const accountWithInstitution = await Conta.findByPk(account.id, {
        include: [
          { model: Instituicao, as: 'instituicao' },
          { model: User, as: 'usuario' }
        ]
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
        const accounts = await Conta.findAll({
          where: { user_cpf: cpf },
          include: [
            { model: Instituicao, as: 'instituicao' },
            { model: User, as: 'usuario' }
          ],
          order: [['created_at', 'DESC']]
        });

        return res.json(accounts);
      } else {
        // Listar todas as contas
        const accounts = await Conta.findAll({
          include: [
            { model: Instituicao, as: 'instituicao' },
            { model: User, as: 'usuario' }
          ],
          order: [['created_at', 'DESC']]
        });

        return res.json(accounts);
      }
    } catch (error) {
      console.error('Error listing accounts:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async saldoTotal(req, res) {
    try {
      const { cpf } = req.params;
      
      const accounts = await Conta.findAll({
        where: { user_cpf: cpf },
        include: [{ model: Instituicao, as: 'instituicao' }]
      });

      const totalBalance = accounts.reduce((sum, account) => {
        return sum + parseFloat(account.balance || 0);
      }, 0);

      return res.json({ 
        cpf,
        totalBalance,
        accounts: accounts.length,
        institutions: accounts.map(acc => acc.instituicao?.nome).filter(Boolean)
      });
    } catch (err) {
      console.error('Erro ao obter saldo total:', err);
      return res.status(500).json({ error: 'Erro ao obter saldo total' });
    }
  }

  async extratoTotal(req, res) {
    try {
      const { cpf } = req.params;
      
      const accounts = await Conta.findAll({
        where: { user_cpf: cpf },
        include: [
                     { 
             model: Transacao, 
             as: 'transacoes',
             include: [{ model: Conta, as: 'conta' }]
           },
          { model: Instituicao, as: 'instituicao' }
        ],
        order: [['created_at', 'DESC']]
      });

      return res.json({ accounts });
    } catch (err) {
      console.error('Erro ao obter extrato:', err);
      return res.status(500).json({ error: 'Erro ao obter extrato' });
    }
  }
}

export default new ContaController();
