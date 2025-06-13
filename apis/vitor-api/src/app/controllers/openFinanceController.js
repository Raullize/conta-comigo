import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import Institution from '../models/Institution.js';

const getDataAccount = async (req, res) => {
  const { cpf } = req.params;
  const institutionId = 1;

  try {
    const user = await User.findOne({ where: { cpf } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const institution = await Institution.findOne({
      where: { id: institutionId },
    });
    if (!institution)
      return res.status(404).json({ error: 'Institution not found' });

    const account = await Account.findOne({
      where: { user_cpf: user.cpf, institution_id: institution.id },
    });
    if (!account)
      return res
        .status(404)
        .json({ error: 'Account not found for this institution' });
    if (!account.consent) {
      return res.json('Not allowed');
    }

    // Busca separada para transações como origem e destino
    const sentTransactions = await Transaction.findAll({
      where: {
        origin_cpf: account.user_cpf,
        institution_id: account.institution_id,
      },
    });

    const receivedTransactions = await Transaction.findAll({
      where: {
        destination_cpf: account.user_cpf,
        institution_id: account.institution_id,
      },
    });

    // Junta e ordena por data (opcional)
    const transactions = [...sentTransactions, ...receivedTransactions].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );

    res.json({
      id_bank: 4,
      cpf: user.cpf,
      balance: account.balance,
      transacoes: transactions.map(transaction => {
        let type;
        if (transaction.origin_cpf === user.cpf) {
          type = 'debit';
        } else {
          type = 'credit';
        }

        return {
          id: transaction.id,
          date: transaction.created_at,
          description: transaction.description,
          value: transaction.value,
          type: type,
          id_bank: 4,
        };
      }),
    });
  } catch (error) {
    console.error('Error getting account data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateConsent = async (req, res) => {
  const { cpf } = req.params;
  const { consent } = req.body;
  const institution_id = 1;

  if (typeof consent !== 'boolean') {
    return res.status(400).json({ error: 'use true or false' });
  }

  try {
    const account = await Account.findOne({
      where: {
        user_cpf: cpf,
        institution_id: institution_id,
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
      institution_id: account.institution_id,
      consent: account.consent,
    });
  } catch (error) {
    console.error('Error updating consent:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export { getDataAccount, updateConsent };
