import User from './models/User.js';
import Conta from './models/Conta.js'; 
import Transacao from './models/Transacao.js'; 
import Instituicao from './models/Instituicao.js'; 

const getDataAccount = async (req, res) => {
  const { cpf } = req.params;
  const institutionId = 1;

  try {
    const user = await User.findOne({ where: { cpf } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const account = await Conta.findOne({
      where: { 
        user_cpf: user.cpf,
        instituicao_id: institutionId
      },
      include: [{ model: Instituicao, as: 'instituicao' }]
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found for this institution' });
    }
    
    const institution = account.instituicao || await Instituicao.findByPk(institutionId);
    if (!institution) {
      return res.status(404).json({ error: 'Institution not found' });
    }

    if (!account.consent) {
      return res.status(403).json({ error: 'Consent not granted by the user.' });
    }

    const transactions = await Transacao.findAll({
      where: {
        conta_id: account.id
      },
      order: [['created_at', 'DESC']]
    });

    const responseData = {
      id_bank: 4, // Patricia API é banco 4 (baseado na porta 4004)
      cpf: user.cpf,
      institution: institution.nome,
      balance: parseFloat(account.balance || 0),
      transactions: transactions.map(transaction => ({
        id: transaction.id,
        date: transaction.data || transaction.created_at,
        description: transaction.descricao,
        value: parseFloat(transaction.valor),
        type: transaction.tipo === 'entrada' ? 'credit' : 'debit'
      })),
    };

    res.json(responseData);

  } catch (error) {
    console.error('[Patricia API] Error getting account data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateConsent = async (req, res) => {
  const { cpf } = req.params;
  const { consent } = req.body;
  const institution_id = 1; 

  if (typeof consent !== 'boolean') {
    return res.status(400).json({ error: 'Consent value must be true or false' });
  }

  try {
    const account = await Conta.findOne({
      where: {
        user_cpf: cpf,
        instituicao_id: institution_id,
      },
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    account.consent = consent;
    await account.save();

    res.json({
      message: 'Consent updated successfully.',
      cpf: account.user_cpf,
      institution_id: 4, // Patricia API é banco 4
      consent: account.consent,
    });
  } catch (error) {
    console.error('[Patricia API] Error updating consent:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export { getDataAccount, updateConsent };