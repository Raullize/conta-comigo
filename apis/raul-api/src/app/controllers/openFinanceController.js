import User from '../models/User.js';
import Account from '../models/BankAccount.js';
import Transaction from '../models/Transaction.js';
import Institution from '../models/Institution.js';

const getDataAccount = async (req, res) => {
  const { cpf } = req.params;

  try {
    const user = await User.findOne({ where: { cpf } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const account = await Account.findOne({
      where: { user_cpf: user.cpf },
      include: ['institution']
    });
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found for this user' });
    }
    
    if (!account.consent) {
      return res.status(403).json({ error: 'Account consent not granted' });
    }

    const transactions = await Transaction.findAll({
      where: { account_id: account.id },
      order: [['created_at', 'DESC']]
    });

    res.json({
      id_bank: account.id,
      cpf: user.cpf,
      institution: account.institution ? account.institution.name : 'Unknown Institution',
      balance: account.balance,
      transactions: transactions.map(transaction => ({
        id: transaction.id,
        date: transaction.created_at,
        description: transaction.description,
        value: transaction.value,
        type: transaction.type === 'entrada' ? 'credit' : 'debit'
      })),
    });
  } catch (error) {
    console.error('Error getting account data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateConsent = async (req, res) => {
  const { cpf } = req.params;
  const { consent } = req.body;

  if (typeof consent !== 'boolean') {
    return res.status(400).json({ error: 'Consent must be true or false' });
  }

  try {
    const account = await Account.findOne({
      where: { user_cpf: cpf },
      include: ['institution']
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    account.consent = consent;
    await account.save();

    res.json({
      message: 'Consent updated successfully',
      cpf: account.user_cpf,
      institution_id: account.institution_id,
      institution_name: account.institution ? account.institution.name : 'Unknown',
      consent: account.consent,
    });
  } catch (error) {
    console.error('Error updating consent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export { getDataAccount, updateConsent };
