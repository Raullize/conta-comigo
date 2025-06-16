const {
  Usuario: User,
  Instituicao: Institution,
  Transacao: Transaction,
  Conta: Account,
} = require('../models');

const getDataAccount = async (req, res) => {
  const { cpf } = req.params;
  const instituicaoId = 1;

  try {
    console.log(`[Dante API] Buscando dados para CPF: ${cpf}`);
    
    const user = await User.findOne({ where: { cpf } });
    if (!user) {
      console.log(`[Dante API] Usuário não encontrado para CPF: ${cpf}`);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log(`[Dante API] Usuário encontrado: ${user.nome} (ID: ${user.id})`);

    const account = await Account.findOne({
      where: { usuarioCpf: user.cpf },
    });
    if (!account) {
      console.log(`[Dante API] Conta não encontrada para CPF: ${cpf}`);
      return res
        .status(404)
        .json({ error: 'Account not found for this institution' });
    }
    console.log(`[Dante API] Conta encontrada: ID ${account.id}, Saldo: ${account.saldo}`);

    const institution = await Institution.findOne({
      where: { id: instituicaoId },
    });
    if (!institution) {
      console.log(`[Dante API] Instituição não encontrada: ID ${instituicaoId}`);
      return res.status(404).json({ error: 'Institution not found' });
    }
    console.log(`[Dante API] Instituição encontrada: ${institution.nome}`);

    if (!account.consent) {
      console.log(`[Dante API] Consentimento não autorizado para CPF: ${cpf}`);
      return res
        .status(403)
        .json({ error: 'Consent not granted by the user.' });
    }

    const transactions = await Transaction.findAll({
      where: {
        usuarioCpf: account.usuarioCpf,
        instituicaoId: institution.id,
      },
    });
    
    console.log(`[Dante API] Transações encontradas: ${transactions.length}`);
    transactions.forEach((tx, index) => {
      console.log(`[Dante API] Transação ${index + 1}: ID=${tx.id}, Tipo=${tx.tipo}, Valor=${tx.valor}, Descrição=${tx.descricao}`);
    });

    const responseData = {
      id_bank: 1,
      cpf: user.cpf,
      institution: institution.nome,
      balance: account.saldo,
      transactions: transactions.map(transaction => ({
        id: transaction.id,
        date: transaction.data,
        description: transaction.descricao,
        value: transaction.valor,
        type: transaction.tipo === 'credito' ? 'credit' : 'debit',
      })),
    };
    
    console.log(`[Dante API] Resposta final:`, JSON.stringify(responseData, null, 2));
    res.json(responseData);
  } catch (error) {
    console.error('Error getting account data for bank 1:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateConsent = async (req, res) => {
  const { cpf } = req.params;
  const { consent } = req.body;
  const institution_id = 1;

  if (typeof consent !== 'boolean') {
    return res
      .status(400)
      .json({ error: 'Consent value must be true or false' });
  }

  try {
    const account = await Account.findOne({
      where: {
        usuarioCpf: cpf,
        instituicaoId: institution_id,
      },
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    account.consent = consent;
    await account.save();

    res.json({
      message: 'Consent updated successfully.',
      cpf: account.usuarioCpf,
      institution_id: account.instituicaoId,
      consent: account.consent,
    });
  } catch (error) {
    console.error('Error updating consent for bank 3:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { getDataAccount, updateConsent };
