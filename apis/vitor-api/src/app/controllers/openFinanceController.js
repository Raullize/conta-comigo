import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import Institution from '../models/Institution.js';

const getDataAccount = async (req, res) => {
  const { cpf } = req.params;
  const { institutionId } = req.query;

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
      res.json('Not allowed');
    }
    const transactions = await Transaction.findAll({
      where: {
        origin_cpf: account.user_cpf,
        institution_id: account.institution_id,
      },
    });

    res.json({
      cpf: user.cpf,
      institution: institution.name,
      balance: account.balance,
      transacoes: transactions.map(transaction => ({
        id: transaction.id,
        date: transaction.date,
        description: transaction.description,
        value: transaction.value,
      })),
    });
  } catch (error) {
    console.error('Error updating consent.:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateConsent = async (req, res) => {
  const { cpf } = req.params;
  const { institution_id, consent } = req.body;

  // Validação básica
  if (typeof consent !== 'boolean') {
    return res.status(400).json({ error: 'use boolean (True or false)' });
  }
  if (!institution_id) {
    scrollY;
    return res.status(400).json({ error: 'insert institution_id.' });
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
