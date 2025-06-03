const { where } = require('sequelize');
const Account = require('../models/Account');
const { alternatives } = require('joi');

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
        .json({ erro: 'Failed to creater account.', detalhe: error.message });
    }
  },

  async updateAccount(req, res) {
    const { id } = req.params;
    const userId = req.userId;

    try {
      const account = await Account.findOne({
        where: { id, userId },
      });

      if (!account) {
        return res.status(404).json({
          error: 'Account not found or does not belong to this user.',
        });
      }

      const updateAccount = await account.update(req.body);

      return res.json(updateAccount);
    } catch (error) {
      return res.status(500).json({ eroor: 'Failed to update account.' });
    }
  },

  async getAllAccounts(req, res) {
    try {
      const account = await Account.findOne({
        where: { id, userId },
      });

      if (!account) {
        return res.status(404).json({
          error: 'Account not found or does not belong to this user.',
        });
      }

      return res.json(account);
    } catch (error) {
      return res.status(500).json({ eroor: 'Failed to update account.' });
    }
  },

  async deleteAccount(req, res) {
    const { id } = req.params;
    const userId = req.userId;

    try {
      const account = await Account.findOne({
        where: { id, userId },
      });

      if (!account) {
        return res.status(404).json({
          error: 'Account not found or does not belong to this user.',
        });
      }

      await account.destroy();

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete account.' });
    }
  },
};
