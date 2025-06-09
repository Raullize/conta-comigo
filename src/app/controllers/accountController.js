// controllers/AccountImportController.js
const axios = require('axios');
const { models } = require('../../database');
const { Account, Institution } = models;

const accountController = {
  async importarContaDoBanco(req, res) {
    const { cpf } = req.params;

    // Usar IPv4 explicitamente
    const bancoUrl = `http://localhost:4005/open-finance/${cpf}`;

    try {
      const response = await axios.get(bancoUrl);
      const { idBank, institution, balance } = response.data;

      const instituicao = await Institution.findOrCreate({
        where: { name: institution },
        defaults: { name: institution },
      });

      const [account] = await Account.upsert({
        user_cpf: cpf,
        institution_id: instituicao[0].id,
        balance: parseFloat(balance),
        consent: true,
      });

      return res.json({
        idBank: account.institution_id,
        cpf: account.user_cpf,
        institution: instituicao[0].name,
        balance: account.balance.toFixed(2),
      });
    } catch (error) {
      console.error('Erro:', error.message);
      return res.status(500).json({
        error: 'Falha ao importar dados do banco',
        details: error.message,
      });
    }
  },
};

module.exports = accountController;
