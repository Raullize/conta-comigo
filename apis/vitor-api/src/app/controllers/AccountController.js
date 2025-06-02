import Account from "../models/Account.js";
import logger from "../../../logger.js";
import Institution from "../models/Institution.js";
import Transaction from "../models/Transaction.js";
class AccountController {
  async createAccount(req, res) {
    const { user_cpf } = req.params;
    const { institution_id } = req.body;

    try {
      const existAccount = await Account.findOne({
        where: { user_cpf, institution_id },
      });

      if (isNaN(existAccount)) {
        return res.status(404).json("Conta já existe");
      }

      const account = await Account.create({
        user_cpf,
        institution_id,
      });

      return res.status(200).json("Conta criada");
    } catch (error) {
      logger.error(error.stack || error.message);
      return res.status(400).json("Erro, Instituição ou CPF Inválidos");
    }
  }
  async getBalance(req, res) {
    try {
      const { user_cpf } = req.params;
      const { institution_id } = req.query;

      const where = { user_cpf };
      if (institution_id) where.institution_id = institution_id;

      const accounts = await Account.findAll({
        where,
        attributes: ["id", "institution_id", "balance"],
      });

      if (accounts.length === 0) {
        return res.status(400).json("Nenhuma conta encontrada");
      }

      if (institution_id) {
        const institution = await Institution.findByPk(institution_id);
        const account = accounts[0];

        return res.json({
          account_id: account.id,
          institution: institution ? institution.name : "Desconhecida",
          balance: parseFloat(account.balance || 0),
        });
      }

      const result = [];
      let totalBalance = 0;

      for (const account of accounts) {
        const institution = await Institution.findByPk(account.institution_id);
        const balance = parseFloat(account.balance || 0);

        result.push({
          conta_id: account.id,
          institution: institution ? institution.name : "Desconhecida",
          balance,
        });

        totalBalance += balance;
      }

      return res.json({
        accounts: result,
        total_balance: totalBalance,
      });
    } catch (error) {
      return res.status(400).json("Erro ao buscar saldo");
    }
  }
  async newDeposit(req, res) {
    const { user_cpf } = req.params;
    const { value, institution_id } = req.body;

    const account = await Account.findOne({
      where: { user_cpf, institution_id },
    });

    if (!isNaN(account)) {
      return res.status(404).json("Conta inválida");
    }

    if (value > 0) {
      await Account.increment("balance", {
        by: value,
        where: { user_cpf, institution_id },
      });
    } else {
      return res.status(400).json("O Valor não pode ser menor que zero");
    }

    await Transaction.create({
      destination_cpf: user_cpf,
      institution_id,
      value,
      type: "DEPOSIT",
    });

    return res.json(`Depósito de $${value} efetuado na conta CPF: ${user_cpf}`);
  }
  async getStatement(req, res) {
    const { user_cpf } = req.params;
    const { institution_id } = req.query;

    const sentFilter = { origin_cpf: user_cpf };
    const receivedFilter = { destination_cpf: user_cpf };

    if (institution_id) {
      sentFilter.institution_id = institution_id;
      receivedFilter.institution_id = institution_id;

      const account = await Account.findOne({
        where: { user_cpf, institution_id },
      });

      if (!isNaN(account)) {
        return res.status(404).json("Conta inválida");
      }
    }

    const sentTransactions = await Transaction.findAll({
      where: sentFilter,
      order: [["createdAt", "DESC"]],
    });

    const receivedTransactions = await Transaction.findAll({
      where: receivedFilter,
      order: [["createdAt", "DESC"]],
    });

    const allTransactions = [sentTransactions, receivedTransactions];

    return res.json(allTransactions);
  }
  async newWithdrawal(req, res) {
    const { user_cpf } = req.params;
    const { value, institution_id } = req.body;

    const account = await Account.findOne({
      where: { user_cpf, institution_id },
    });

    if (!isNaN(account)) {
      return res.status(404).json("Conta inválida");
    }

    if (value <= account.balance) {
      await Account.increment("balance", {
        by: -value,
        where: { user_cpf, institution_id },
      });
    } else {
      return res.status(400).json("Saldo Insuficiente");
    }

    await Transaction.create({
      origin_cpf: user_cpf,
      institution_id,
      value,
      type: "withdrawal",
    });

    return res.json(`Saque de $${value} efetuado na conta CPF: ${user_cpf}`);
  }
}

export default new AccountController();
