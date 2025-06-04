const Account = require('../models/Account');
const User = require('../models/User');

module.exports = {
  async createAccount(req, res) {
    const userId = req.userId;
    const { institution } = req.body;

    if (!userId) {
      return res.status(404).json({ error: "The user doesn't exists" });
    }

    if (!institution) {
      return res
        .status(400)
        .json({ error: 'Missing required account fields.' });
    }

    try {
      const accountExists = await Account.findOne({
        where: {
          userId,
          institution,
        },
      });

      if (accountExists) {
        return res
          .status(400)
          .json({ error: 'This account already exists for this user.' });
      }

      const newAccount = await Account.create({
        userId,
        institution,
      });

      return res.status(201).json(newAccount);
    } catch (error) {
      return res
        .status(500)
        .json({ erro: 'Erro ao criar conta.', detalhe: error.message });
    }
  },

  async updateAccount(req, res) {
    try {
    } catch (error) {}
  },

  async getAllAccounts(req, res) {
    try {
    } catch (error) {}
  },

  async deleteAccount(req, res) {
    try {
    } catch (error) {}
  },
};
