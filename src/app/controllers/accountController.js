const axios = require('axios');
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../database/database.js');

const Account = require('../models/Account.js')(sequelize, DataTypes);
const Transaction = require('../models/Transaction.js')(sequelize, DataTypes);

const banksList = {
  1: process.env.DANTE_API_URL,
  2: process.env.LUCAS_API_URL,
  3: process.env.PATRICIA_API_URL,
  4: process.env.VITOR_API_URL,
  5: process.env.RAUL_API_URL,
  6: process.env.CAPUTI_API_URL,
};

class accountController {
  static async createAccount(req, res) {
    const idBank = req.params.idBank;
    const { cpf } = req.body;

    try {
      const url = `${banksList[idBank]}/open-finance/${cpf}`;
      const response = await axios.get(url, { timeout: 5000 });
      const data = response.data;

      const existingAccount = await Account.findOne({
        where: { idBank, user_cpf: data.cpf },
      });

      if (existingAccount) {
        return res.status(409).json({ error: 'Account already exists.' });
      }

      const createdAccount = await Account.create({
        idBank,
        user_cpf: data.cpf,
        balance: data.balance,
      });

      if (Array.isArray(data.transacoes) && data.transacoes.length > 0) {
        await Transaction.bulkCreate(
          data.transacoes.map(transactionData => ({
            origin_cpf: data.cpf,
            destination_cpf: transactionData.destination_cpf,
            value: transactionData.value,
            type: transactionData.type,
            description: transactionData.description,
            idBank,
          }))
        );
      }

      return res.status(201).json({
        message: 'Account created successfully!',
        account: createdAccount,
        transactions: data.transacoes,
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Database error.',
      });
    }
  }

  static async updateAccount(req, res) {
    const idBank = req.params.idBank;
    const { cpf } = req.body;

    try {
      const url = `${banksList[idBank]}/open-finance/${cpf}`;
      const response = await axios.get(url, { timeout: 5000 });
      const data = response.data;

      const account = await Account.findOne({
        where: { idBank, user_cpf: data.cpf },
      });

      if (!account) {
        return res.status(404).json({ error: 'Account not found.' });
      }

      await account.update({ balance: data.balance });

      const importedTransactions = [];
      if (Array.isArray(data.transacoes) && data.transacoes.length > 0) {
        for (const transactionData of data.transacoes) {
          const transactionExists = await Transaction.findOne({
            where: {
              origin_cpf: data.cpf,
              idBank,
              value: transactionData.value,
              description: transactionData.description,
              created_at: transactionData.date,
            },
          });

          if (!transactionExists) {
            const createdTransaction = await Transaction.create({
              origin_cpf: data.cpf,
              destination_cpf: transactionData.destination_cpf,
              value: transactionData.value,
              type: transactionData.type,
              description: transactionData.description,
              idBank,
            });
            importedTransactions.push(createdTransaction);
          }
        }
      }

      return res.status(200).json({
        message: 'Account updated. New transactions imported.',
        newTransactions: importedTransactions,
        newBalance: data.balance,
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Database update error.',
      });
    }
  }
}

module.exports = accountController;
