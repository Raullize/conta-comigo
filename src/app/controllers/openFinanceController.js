const axios = require('axios');
const { Sequelize } = require('sequelize');
const {
  models: { Account, Transaction, User },
} = require('../../database');

class OpenFinanceController {
  // Verifica se o usuário tem pelo menos uma conta vinculada
  static async checkLinkedAccounts(req, res) {
    try {
      if (!req.user || !req.user.cpf) {
        return res.status(401).json({ error: 'User authentication failed' });
      }
      
      const { cpf } = req.user;
      
      const linkedAccounts = await Account.findAll({
        where: { 
          user_cpf: cpf,
          consent: true 
        }
      });

      return res.json({
        hasLinkedAccounts: linkedAccounts.length > 0,
        accountsCount: linkedAccounts.length,
        accounts: linkedAccounts.map(account => ({
          id_bank: account.id_bank,
          balance: account.balance
        }))
      });
    } catch (error) {
      console.error('Error checking linked accounts:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Vincula uma conta da API do Vitor (id_bank = 4)
  static async linkVitorAccount(req, res) {
    try {
      if (!req.user || !req.user.cpf) {
        return res.status(401).json({ error: 'User authentication failed' });
      }
      
      const { cpf } = req.user;
      const { consent } = req.body;

      if (typeof consent !== 'boolean') {
        return res.status(400).json({ error: 'Consent must be a boolean value' });
      }

      // URL da API do Vitor - tentar múltiplas opções
      const vitorApiUrl = process.env.VITOR_API_URL || `http://localhost:${process.env.VITOR_API_EXT_PORT || '4005'}`;
      
      // Primeiro, atualiza o consentimento na API do Vitor
      try {
        const consentResponse = await axios.patch(`${vitorApiUrl}/open-finance/${cpf}/consent`, {
          consent: consent
        }, {
          timeout: 5000, // 5 segundos de timeout
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log('Consent updated successfully:', consentResponse.status);
      } catch (error) {
        console.error('Error updating consent in Vitor API:', {
          message: error.message,
          code: error.code,
          url: `${vitorApiUrl}/open-finance/${cpf}/consent`,
          status: error.response?.status,
          data: error.response?.data
        });
        
        // Se a API do Vitor não estiver disponível, simular sucesso para desenvolvimento
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
          console.log('Vitor API not available, proceeding with local operation only');
        } else {
          return res.status(400).json({ 
            error: 'Failed to update consent in external API',
            details: error.message
          });
        }
      }

      if (consent) {
        // Se o consentimento foi dado, busca os dados da API do Vitor
        let externalData = null;
        try {
          const response = await axios.get(`${vitorApiUrl}/open-finance/${cpf}`, {
            timeout: 5000,
            headers: {
              'Content-Type': 'application/json'
            }
          });
          externalData = response.data;
          console.log('Data fetched from Vitor API successfully');
        } catch (error) {
          console.error('Error fetching data from Vitor API:', {
            message: error.message,
            code: error.code,
            url: `${vitorApiUrl}/open-finance/${cpf}`,
            status: error.response?.status
          });
          
          // Se a API do Vitor não estiver disponível, usar dados simulados
          if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            console.log('Using simulated data for development');
            externalData = {
              balance: 1000.00,
              accountNumber: '12345-6',
              agency: '0001'
            };
          } else {
            return res.status(400).json({ 
              error: 'Failed to fetch data from external API',
              details: error.message
            });
          }
        }
        
        if (externalData) {

          // Verifica se a conta já existe
          let account = await Account.findOne({
            where: { 
              user_cpf: cpf,
              id_bank: 4 // ID do banco Vitor
            }
          });

          if (account) {
            // Atualiza conta existente
            account.balance = externalData.balance;
            account.consent = true;
            await account.save();
          } else {
            // Cria nova conta
            account = await Account.create({
              user_cpf: cpf,
              id_bank: 4,
              balance: externalData.balance,
              consent: true
            });
          }

          // Sincroniza transações
          if (externalData.transactions && externalData.transactions.length > 0) {
            // Remove transações antigas desta conta
            await Transaction.destroy({
              where: {
                id_bank: 4,
                [Sequelize.Op.or]: [
                  { origin_cpf: cpf },
                  { destination_cpf: cpf }
                ]
              }
            });

            // Insere novas transações
            const transactionsToInsert = externalData.transactions.map(transaction => ({
              origin_cpf: transaction.type === 'debit' ? cpf : transaction.origin_cpf || null,
              destination_cpf: transaction.type === 'credit' ? cpf : transaction.destination_cpf || null,
              value: parseFloat(transaction.value.toString().replace(/[^\d.-]/g, '')),
              type: transaction.type === 'debit' ? 'D' : 'C',
              description: transaction.description,
              id_bank: 4,
              created_at: new Date(transaction.date)
            }));

            await Transaction.bulkCreate(transactionsToInsert);
          }

          return res.json({
            message: 'Account linked successfully',
            account: {
              id_bank: account.id_bank,
              balance: account.balance,
              transactionsCount: externalData.transactions ? externalData.transactions.length : 0
            }
          });
        } else {
          return res.status(400).json({ error: 'No data available from external API' });
        }
      } else {
        // Se o consentimento foi revogado, atualiza apenas o status
        await Account.update(
          { consent: false },
          { 
            where: { 
              user_cpf: cpf,
              id_bank: 4
            }
          }
        );

        return res.json({ message: 'Consent revoked successfully' });
      }

    } catch (error) {
      console.error('Error linking Vitor account:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Lista as contas conectadas do usuário
  static async getConnectedAccounts(req, res) {
    try {
      if (!req.user || !req.user.cpf) {
        return res.status(401).json({ error: 'User authentication failed' });
      }
      
      const { cpf } = req.user;
      
      const linkedAccounts = await Account.findAll({
        where: { 
          user_cpf: cpf,
          consent: true 
        }
      });

      // Mapeamento dos bancos
      const bankNames = {
        1: 'Banco Dante',
        2: 'Banco Lucas', 
        3: 'Banco Patricia',
        4: 'Nubank', // Nome real do banco cadastrado na API do Vitor
        5: 'Banco Raul',
        6: 'Banco Caputi'
      };

      const connectedAccounts = linkedAccounts.map(account => ({
        id: account.id_bank,
        name: bankNames[account.id_bank] || `Banco ${account.id_bank}`,
        balance: account.balance,
        connected: true
      }));

      return res.json({
        accounts: connectedAccounts,
        count: connectedAccounts.length
      });
    } catch (error) {
      console.error('Error getting connected accounts:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Desvincula uma conta específica
  static async disconnectAccount(req, res) {
    try {
      if (!req.user || !req.user.cpf) {
        return res.status(401).json({ error: 'User authentication failed' });
      }
      
      const { cpf } = req.user;
      const { id_bank } = req.params;

      // Atualiza o consentimento para false
      const [updatedRows] = await Account.update(
        { consent: false },
        { 
          where: { 
            user_cpf: cpf,
            id_bank: parseInt(id_bank)
          }
        }
      );

      if (updatedRows === 0) {
        return res.status(404).json({ error: 'Account not found' });
      }

      // Remove as transações relacionadas a esta conta
      await Transaction.destroy({
        where: {
          id_bank: parseInt(id_bank),
          [Sequelize.Op.or]: [
            { origin_cpf: cpf },
            { destination_cpf: cpf }
          ]
        }
      });

      return res.json({ message: 'Account disconnected successfully' });
    } catch (error) {
      console.error('Error disconnecting account:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Desvincula todas as contas do usuário
  static async disconnectAllAccounts(req, res) {
    try {
      if (!req.user || !req.user.cpf) {
        return res.status(401).json({ error: 'User authentication failed' });
      }
      
      const { cpf } = req.user;

      // Atualiza o consentimento de todas as contas para false
      await Account.update(
        { consent: false },
        { 
          where: { 
            user_cpf: cpf
          }
        }
      );

      // Remove todas as transações do usuário
      await Transaction.destroy({
        where: {
          [Sequelize.Op.or]: [
            { origin_cpf: cpf },
            { destination_cpf: cpf }
          ]
        }
      });

      return res.json({ message: 'All accounts disconnected successfully' });
    } catch (error) {
      console.error('Error disconnecting all accounts:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Sincroniza dados de uma conta específica
  static async syncAccount(req, res) {
    try {
      if (!req.user || !req.user.cpf) {
        return res.status(401).json({ error: 'User authentication failed' });
      }

      const { id_bank: rawid_bank } = req.params;
      const { cpf } = req.user;

      // Validação de entrada
      const id_bank = parseInt(rawid_bank);
      if (isNaN(id_bank) || id_bank < 1 || id_bank > 6) {
        return res.status(400).json({ error: 'Invalid bank ID' });
      }

      // Verifica se a conta existe e está vinculada
      const account = await Account.findOne({
        where: { 
          id_bank, 
          user_cpf: cpf,
          consent: true 
        }
      });

      if (!account) {
        return res.status(404).json({ error: 'Account not found or not linked' });
      }

      // Importa o AccountController para usar a funcionalidade de sincronização
      const AccountController = require('./accountController');
      
      // Chama o método de atualização que já existe
      const mockReq = {
        params: { id_bank: rawid_bank },
        body: { cpf }
      };
      
      const mockRes = {
        status: (code) => ({
          json: (data) => ({ statusCode: code, data })
        }),
        json: (data) => ({ statusCode: 200, data })
      };

      const result = await AccountController.updateAccount(mockReq, mockRes);
      
      if (result.statusCode === 200) {
        return res.json({
          message: 'Account synchronized successfully',
          newBalance: result.data.newBalance,
          newTransactionsCount: result.data.newTransactions?.length || 0,
          lastSync: new Date().toISOString()
        });
      } else {
        return res.status(result.statusCode).json(result.data);
      }
    } catch (error) {
      console.error('Error syncing account:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Lista todas as instituições disponíveis
  static async listAvailableInstitutions(req, res) {
    try {
      const institutions = [
        { id: 1, name: 'Banco do Brasil', port: 3001 },
        { id: 2, name: 'Caixa Econômica Federal', port: 3002 },
        { id: 3, name: 'Itaú', port: 3003 },
        { id: 4, name: 'Vitor Bank', port: 3004 },
        { id: 5, name: 'Santander', port: 3005 },
        { id: 6, name: 'Bradesco', port: 3006 }
      ];

      return res.json({ institutions });
    } catch (error) {
      console.error('Error listing institutions:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = OpenFinanceController;