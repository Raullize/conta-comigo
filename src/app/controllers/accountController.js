const axios = require('axios');
const { User } = require('../models/User');
const jwt = require('jsonwebtoken');

class accountController {
  static async createAccount(req, res) {
    try {
      const idBank = req.params.idBank;
      const { cpf } = req.body;

      const banksList = {
        1: process.env.DANTE_API_URL,
        2: process.env.LUCAS_API_URL,
        3: process.env.PATRICIA_API_URL,
        4: process.env.VITOR_API_URL,
        5: process.env.RAUL_API_URL,
        6: process.env.CAPUTI_API_URL,
      };

      const url = `${banksList[idBank]}/open-finance/${cpf}`;

      const response = await axios.get(url, { timeout: 5000 });
      return res.json(response.data);
    } catch (error) {
      res.json('Usuario não encontrado');
    }
  }
}

module.exports = accountController;
