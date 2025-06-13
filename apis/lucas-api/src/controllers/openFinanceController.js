const {
  Usuario: User,
  Instituicao: Institution,
  Transacao: Transaction,
  Conta: Account,
} = require('../../models');

const getDataAccount = async (req, res) => {
  const { cpf } = req.params;
  const institution_id = 1;

  try {
    const user = await User.findOne({ where: { cpf } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const account = await Account.findOne({
      where: { usuarioCpf: user.cpf },
    });
    if (!account)
      return res
        .status(404)
        .json({ error: 'Account not found for this institution' });

    const institution = await Institution.findOne({
      where: { id: account.instituicaoId },
    });
    if (!institution)
      return res.status(404).json({ error: 'Institution not found' });

    if (!account.consent) {
      return res.json('Not allowed');
    }

    const transactions = await Transaction.findAll({
      where: {
        usuarioCpf: account.usuarioCpf,
        instituicaoId: account.instituicaoId,
      },
    });

    res.json({
      id_bank: 2,
      cpf: user.cpf,
      institution: institution.nome,
      balance: account.saldo,
      transactions: transactions.map(transaction => ({
        id: transaction.id,
        date: transaction.data,
        description: transaction.descricao,
        value: transaction.valor,
        type: transaction.tipo === 'entrada' ? 'credit' : 'debit',
      })),
    });
  } catch (error) {
    // console.error('Error updating consent.:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateConsent = async (req, res) => {
  const { cpf } = req.params;
  const { consent } = req.body;
  const institution_id = 2;

  if (typeof consent !== 'boolean') {
    return res.status(400).json({ error: 'use true or false' });
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
    console.error('Error updating consent:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { getDataAccount, updateConsent };
