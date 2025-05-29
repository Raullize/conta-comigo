import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";
import logger from "../../../logger.js";
class TransactionController {
  async newTransaction(req, res) {
    const { origin_cpf } = req.params;
    const { institution_id, value, description, destination_cpf } = req.body;

    try {
      if (!institution_id || !value || !origin_cpf || !destination_cpf) {
        return res.status(400).json("Campos obrigatórios não informados");
      }

      const origin_account = await Account.findOne({
        where: { user_cpf: origin_cpf, institution_id },
      });

      if (!isNaN(origin_account)) {
        return res.status(404).json("Conta de origem inválida");
      }

      const destination_account = await Account.findOne({
        where: { user_cpf: destination_cpf, institution_id },
      });

      if (!isNaN(destination_account)) {
        return res.status(404).json("Conta destinataria inválida");
      }

      if (origin_account.balance >= value) {
        await Account.increment("balance", {
          by: -value,
          where: { user_cpf: origin_cpf, institution_id },
        });

        await Account.increment("balance", {
          by: value,
          where: { user_cpf: destination_cpf, institution_id },
        });

        await Transaction.create({
          origin_cpf,
          destination_cpf,
          institution_id,
          value,
          type: "TRANSFER",
          description: description || "Transferência entre contas",
        });

        return res.json("Transação realizada com sucesso!");
      } else {
        return res
          .status(400)
          .json("O Destinatário não possui saldo suficiente");
      }
    } catch (error) {
      logger.error(`Erro na transação: ${error.message}`);
      return res.status(500).json("Erro interno do servidor");
    }
  }
}

export default new TransactionController();
