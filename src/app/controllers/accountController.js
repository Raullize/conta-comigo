const axios = require('axios');
const { Sequelize, Op } = require('sequelize');
const sequelize = require('../../database/database.js');

const Account = require('../models/Account.js')(sequelize, Sequelize.DataTypes);
const Transaction = require('../models/Transaction.js')(
  sequelize,
  Sequelize.DataTypes
);

const banksList = {
  1: process.env.DANTE_API_URL,
  2: process.env.LUCAS_API_URL,
  3: process.env.PATRICIA_API_URL,
  4: process.env.VITOR_API_URL,
  5: process.env.RAUL_API_URL,
  6: process.env.CAPUTI_API_URL,
};

class AccountController {
  static async validateBank(id_bank) {
    const bankId = Number(id_bank);
    return {
      isValid: !!banksList[bankId],
      id_bank: bankId,
      baseURL: banksList[bankId],
    };
  }

  static async handleExternalAPI(baseURL, cpf) {
    const url = `${baseURL}/open-finance/${cpf}`;
    try {
      const response = await axios.get(url, { timeout: 10000 });
      return response.data;
    } catch (error) {
      console.error(`External API error: ${error.message}`);
      throw new Error('Failed to retrieve data from bank API');
    }
  }

  static async createAccount(req, res) {
    try {
      const { id_bank: rawid_bank } = req.params;
      const { cpf } = req.body;

      // Validação de entrada
      const { isValid, id_bank, baseURL } =
        await AccountController.validateBank(rawid_bank);
      if (!isValid || !/^\d{11}$/.test(cpf)) {
        return res.status(400).json({ error: 'Invalid parameters' });
      }

      // Operação atômica
      const result = await sequelize.transaction(async t => {
        const externalData = await AccountController.handleExternalAPI(
          baseURL,
          cpf
        );

        // Verifica conta existente
        const existingAccount = await Account.findOne({
          where: { id_bank, user_cpf: externalData.cpf },
          transaction: t,
        });

        if (existingAccount) {
          throw new Error('Account already exists');
        }

        // Cria nova conta
        const newAccount = await Account.create(
          {
            id_bank,
            user_cpf: externalData.cpf,
            balance: externalData.balance,
            consent: true,
          },
          { transaction: t }
        );

        // Importa transações
        if (externalData.transacoes?.length > 0) {
          await Transaction.bulkCreate(
            externalData.transacoes.map(t => ({
              origin_cpf: externalData.cpf,
              value: t.value,
              type: t.type,
              description: t.description,
              id_bank,
              created_at: t.date || new Date(),
            })),
            { transaction: t }
          );
        }

        return newAccount;
      });

      return res.status(201).json({
        message: 'Account created successfully',
        account: result,
      });
    } catch (error) {
      console.error(`Create Account Error: ${error.message}`);
      return res.status(error.status || 500).json({
        error: error.message,
        details: error.original?.message || error.response?.data,
      });
    }
  }

  static async updateAccount(req, res) {
    try {
      const { id_bank: rawid_bank } = req.params;
      const { cpf } = req.body;

      // Validação de entrada
      const { isValid, id_bank, baseURL } =
        await AccountController.validateBank(rawid_bank);
      if (!isValid || !/^\d{11}$/.test(cpf)) {
        return res.status(400).json({ error: 'Invalid parameters' });
      }

      // Operação atômica
      const result = await sequelize.transaction(async t => {
        const externalData = await AccountController.handleExternalAPI(
          baseURL,
          cpf
        );

        // Encontra conta existente
        const account = await Account.findOne({
          where: { id_bank, user_cpf: externalData.cpf },
          transaction: t,
        });

        if (!account) {
          throw new Error('Account not found');
        }

        // Atualiza saldo
        await account.update(
          { balance: externalData.balance },
          { transaction: t }
        );

        // Importa novas transações
        const newTransactions = [];
        if (externalData.transacoes?.length > 0) {
          for (const transaction of externalData.transacoes) {
            const exists = await Transaction.findOne({
              where: {
                origin_cpf: externalData.cpf,
                id_bank,
                value: transaction.value,
                description: transaction.description,
                created_at: transaction.date,
              },
              transaction: t,
            });

            if (!exists) {
              const newTransaction = await Transaction.create(
                {
                  origin_cpf: externalData.cpf,
                  destination_cpf: transaction.destination_cpf,
                  value: transaction.value,
                  type: transaction.type,
                  description: transaction.description,
                  id_bank,
                  created_at: transaction.date || new Date(),
                },
                { transaction: t }
              );
              newTransactions.push(newTransaction);
            }
          }
        }

        return { account, newTransactions };
      });

      return res.status(200).json({
        message: 'Account updated successfully',
        newBalance: result.account.balance,
        newTransactions: result.newTransactions,
      });
    } catch (error) {
      console.error(`Update Account Error: ${error.message}`);
      return res.status(error.status || 500).json({
        error: error.message,
        details: error.original?.message || error.response?.data,
      });
    }
  }
}

module.exports = AccountController;
