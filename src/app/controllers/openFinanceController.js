const axios = require('axios');
const { Sequelize, Op } = require('sequelize');
const sequelize = require('../../database/database.js');
const {
  models: { Account, Transaction, User },
} = require('../../database');
const Budget = require('../models/Budget');
const crypto = require('crypto');

class OpenFinanceController {
  static async createOrUpdateAccount(cpf, accountData, institutionName, apiSource = 'vitor') {
    let account = await Account.findOne({
      where: { 
        user_cpf: cpf,
        id_bank: accountData.id
      }
    });

    if (account) {
      account.balance = accountData.balance || accountData.saldo || 0;
      account.consent = true;
      account.institution_name = institutionName;
      account.api_source = apiSource;
      account.updated_at = new Date();
      await account.save();
    } else {
      account = await Account.create({
        user_cpf: cpf,
        id_bank: accountData.id,
        balance: accountData.balance || accountData.saldo || 0,
        consent: true,
        institution_name: institutionName,
        api_source: apiSource
      });
    }

    return account;
  }

  static async syncTransactions(cpf, accountId, transactions) {
    console.log(`[DEBUG syncTransactions] CPF: ${cpf}, AccountID: ${accountId}, Transações recebidas: ${transactions ? transactions.length : 0}`);
    
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      console.log(`[DEBUG syncTransactions] Nenhuma transação para sincronizar`);
      return;
    }

    const deletedCount = await Transaction.destroy({
      where: {
        id_bank: accountId,
        [Sequelize.Op.or]: [
          { origin_cpf: cpf },
          { destination_cpf: cpf }
        ]
      }
    });

    const transactionsToCreate = transactions.map((transaction, index) => {
      const isCredit = transaction.type === 'credit' || 
                      transaction.tipo === 'credito' || 
                      transaction.type === 'entrada' ||
                      transaction.tipo === 'entrada';
      
      const isDebit = transaction.type === 'saida' || 
                     transaction.tipo === 'saida' ||
                     transaction.type === 'debit' ||
                     transaction.tipo === 'debito';
      
      const finalType = isCredit ? 'C' : 'D';
      

      return {
        origin_cpf: finalType === 'C' ? null : cpf,
        destination_cpf: finalType === 'C' ? cpf : null,
        value: Math.abs(parseFloat(transaction.valor || transaction.value || 0)),
        type: finalType,
        description: transaction.descricao || transaction.description || 'Transação',
        created_at: transaction.data || transaction.date || transaction.createdAt || new Date(),
        id_bank: accountId,
        category: 'Não classificado'
      };
    });

    console.log(`[DEBUG syncTransactions] Criando ${transactionsToCreate.length} transações:`, transactionsToCreate.map(t => ({
      tipo: t.type,
      valor: t.value,
      descricao: t.description
    })));

    await Transaction.bulkCreate(transactionsToCreate);
  }
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

  static async linkLucasAccount(req, res) {
    try {
      if (!req.user || !req.user.cpf) {
        return res.status(401).json({ error: 'User authentication failed' });
      }
      
      const { cpf } = req.user;
      const { consent } = req.body;
      
      if (!consent) {
        return res.status(400).json({ error: 'Consent is required' });
      }
      
      const lucasApiUrl = process.env.LUCAS_API_URL || 'http://localhost:4003';
      
      try {
        const axios = require('axios');
        
        const userResponse = await axios.get(`${lucasApiUrl}/usuarios/${cpf}`);
        
        if (!userResponse.data) {
          return res.status(404).json({ 
            error: 'Usuário não encontrado na API do Lucas. Cadastre o usuário primeiro.' 
          });
        }
        
        const saldoResponse = await axios.get(`${lucasApiUrl}/usuarios/${cpf}/saldo`);
        
        if (!saldoResponse.data) {
          return res.status(404).json({ 
            error: 'Nenhuma conta encontrada na API do Lucas. Cadastre uma conta primeiro.' 
          });
        }
        
        const cpfNumbers = cpf.replace(/\D/g, '');
        let numericId = 0;
        for (let i = 0; i < cpfNumbers.length; i++) {
          numericId = (numericId * 10 + parseInt(cpfNumbers[i])) % 2000000000; 
        }
        numericId = numericId + 1000000;
        
        const lucasAccount = {
          id: numericId,
          saldo: saldoResponse.data.saldoTotal || 0
        };
        
        let transactionsData = [];
        try {
          const transacoesResponse = await axios.get(`${lucasApiUrl}/usuarios/${cpf}/transacoes`);
          transactionsData = transacoesResponse.data.transacoes || [];
        } catch (transError) {
  
        }
        
        let institutionName = null;
        
        if (saldoResponse.data.instituicao && Array.isArray(saldoResponse.data.instituicao) && saldoResponse.data.instituicao.length > 0) {
          institutionName = saldoResponse.data.instituicao[0].nomeInstituicao;
        }
        
        if (!institutionName) {
          return res.status(400).json({ error: 'Nome da instituição não encontrado na API Lucas' });
        }
        
        const account = await OpenFinanceController.createOrUpdateAccount(cpf, lucasAccount, institutionName, 'lucas');
        
        await OpenFinanceController.syncTransactions(cpf, account.id_bank, transactionsData);
        
        return res.json({ 
          message: 'Conta vinculada com sucesso',
          account: {
            id_bank: account.id_bank,
            balance: account.balance,
            institution_name: account.institution_name
          }
        });
        
      } catch (apiError) {
        console.error('Error connecting to Lucas API:', apiError.message);
        return res.status(400).json({ 
          error: 'Erro ao conectar com a API do Lucas',
          details: apiError.message
        });
      }
      
    } catch (error) {
      console.error('Error linking Lucas account:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async linkGenericAccount(req, res, apiName, apiUrl, institutionName) {
    try {
      if (!req.user || !req.user.cpf) {
        return res.status(401).json({ error: 'User authentication failed' });
      }
      
      const { cpf } = req.user;
      const { consent } = req.body;
      
      if (!consent) {
        return res.status(400).json({ error: 'Consent is required' });
      }
      
      try {
        let userResponse;
        try {
          userResponse = await axios.get(`${apiUrl}/users/${cpf}`);
        } catch (error) {
          userResponse = await axios.get(`${apiUrl}/usuarios/${cpf}`);
        }
        
        if (!userResponse.data) {
          return res.status(404).json({ 
            error: `Usuário não encontrado na API ${apiName}. Cadastre o usuário primeiro.` 
          });
        }

        let accountsResponse;
        try {
          accountsResponse = await axios.get(`${apiUrl}/users/${cpf}/accounts`);
        } catch (error) {
          accountsResponse = { data: [] };
        }
        
        let balanceData = 0;
        try {
          const balanceResponse = await axios.get(`${apiUrl}/users/${cpf}/balance`);
          balanceData = balanceResponse.data.totalBalance || balanceResponse.data.saldo || 0;
        } catch (error) {
          if (accountsResponse.data && accountsResponse.data.length > 0) {
            balanceData = accountsResponse.data.reduce((total, account) => {
              return total + parseFloat(account.balance || account.saldo || 0);
            }, 0);
          } else {
            balanceData = userResponse.data.saldo || userResponse.data.balance || 0;
          }
        }
        
        const cpfNumbers = cpf.replace(/\D/g, '');
        const apiHash = apiName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        let numericId = 0;
        for (let i = 0; i < cpfNumbers.length; i++) {
          numericId = (numericId * 10 + parseInt(cpfNumbers[i])) % 2000000000;
        }
        numericId = (numericId + apiHash * 1000) % 2000000000 + 1000000;
        
        const accountData = {
          id: numericId,
          saldo: balanceData
        };
        
        let transactionsData = [];
        try {
          const transactionsResponse = await axios.get(`${apiUrl}/users/${cpf}/transactions`);
          transactionsData = transactionsResponse.data.transactions || transactionsResponse.data || [];
        } catch (error) {
          try {
            const transactionsResponse = await axios.get(`${apiUrl}/usuarios/${cpf}/transacoes`);
            transactionsData = transactionsResponse.data.transacoes || transactionsResponse.data.transactions || [];
          } catch (transError) {
            console.log(`[${apiName}] Endpoint de transações não disponível`);
          }
        }
        
        console.log(`[${apiName}] Encontradas ${transactionsData.length} transações para CPF ${cpf}`);
        
        const apiSource = apiName.toLowerCase();
        const account = await OpenFinanceController.createOrUpdateAccount(cpf, accountData, institutionName, apiSource);
        
        await OpenFinanceController.syncTransactions(cpf, account.id_bank, transactionsData);
        
        return res.json({ 
          message: 'Conta vinculada com sucesso',
          account: {
            id_bank: account.id_bank,
            balance: account.balance,
            institution_name: account.institution_name
          }
        });
        
      } catch (apiError) {
        console.error(`Error connecting to ${apiName} API:`, apiError.message);
        return res.status(400).json({ 
          error: `Erro ao conectar com a API ${apiName}`,
          details: apiError.message
        });
      }
      
    } catch (error) {
      console.error(`Error linking ${apiName} account:`, error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async linkPatriciaAccount(req, res) {
    try {
      if (!req.user || !req.user.cpf) {
        return res.status(401).json({ error: 'User authentication failed' });
      }
      
      const { cpf } = req.user;
      const { consent } = req.body;
      
      if (!consent) {
        return res.status(400).json({ error: 'Consent is required' });
      }
      
      const patriciaApiUrl = process.env.PATRICIA_API_URL || 'http://localhost:4004';
      
      try {
        await axios.patch(`${patriciaApiUrl}/open-finance/${cpf}/consent`, { consent: true });
        
        const accountResponse = await axios.get(`${patriciaApiUrl}/open-finance/${cpf}`);
        
        if (!accountResponse.data) {
          return res.status(404).json({ 
            error: 'Usuário não encontrado na API Patricia. Cadastre o usuário primeiro.' 
          });
        }
        
        const accountData = accountResponse.data;
        
        const patriciaAccount = {
          id: accountData.id_bank || 4,
          saldo: accountData.balance || 0
        };
        
        const institutionName = accountData.institution || 'Banco Patricia';
        
        const account = await OpenFinanceController.createOrUpdateAccount(cpf, patriciaAccount, institutionName, 'patricia');
        
        let transactionsData = accountData.transactions || [];
        
        await OpenFinanceController.syncTransactions(cpf, account.id_bank, transactionsData);
        
        return res.json({ 
          message: 'Conta vinculada com sucesso',
          account: {
            id_bank: account.id_bank,
            balance: account.balance,
            institution_name: account.institution_name
          }
        });
        
      } catch (apiError) {
        console.error('Error connecting to Patricia API:', apiError.message);
        return res.status(400).json({ 
          error: 'Erro ao conectar com a API Patricia',
          details: apiError.message
        });
      }
      
    } catch (error) {
      console.error('Error linking Patricia account:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }


  static async linkDanteAccount(req, res) {
    try {
      if (!req.user || !req.user.cpf) {
        return res.status(401).json({ error: 'User authentication failed' });
      }
      
      const { cpf } = req.user;
      const { consent } = req.body;
      
      if (!consent) {
        return res.status(400).json({ error: 'Consent is required' });
      }
      
      const danteApiUrl = process.env.DANTE_API_URL || 'http://localhost:4002';
      
      try {
        const userResponse = await axios.get(`${danteApiUrl}/open-finance/${cpf}`);
        
        if (!userResponse.data) {
          return res.status(404).json({ 
            error: 'Usuário não encontrado na API Dante. Cadastre o usuário primeiro.' 
          });
        }
        
        const cpfNumbers = cpf.replace(/\D/g, '');
        const apiHash = 'Dante'.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        let numericId = 0;
        for (let i = 0; i < cpfNumbers.length; i++) {
          numericId = (numericId * 10 + parseInt(cpfNumbers[i])) % 2000000000;
        }
        numericId = (numericId + apiHash * 1000) % 2000000000 + 1000000;
        
        const accountData = {
          id: numericId,
          saldo: userResponse.data.saldoTotal || userResponse.data.balance || 0
        };
        
        let transactionsData = [];
        if (userResponse.data.transactions) {
          transactionsData = userResponse.data.transactions;
        }
        
        const institutionName = userResponse.data.institution || 'Banco Dante';
        
        const account = await OpenFinanceController.createOrUpdateAccount(cpf, accountData, institutionName, 'dante');
        
        await OpenFinanceController.syncTransactions(cpf, account.id_bank, transactionsData);
        
        return res.json({ 
          message: 'Conta vinculada com sucesso',
          account: {
            id_bank: account.id_bank,
            balance: account.balance,
            institution_name: account.institution_name
          }
        });
        
      } catch (apiError) {
        console.error('Error connecting to Dante API:', apiError.message);
        return res.status(400).json({ 
          error: 'Erro ao conectar com a API Dante',
          details: apiError.message
        });
      }
      
    } catch (error) {
      console.error('Error linking Dante account:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async linkRaulAccount(req, res) {
    try {
      if (!req.user || !req.user.cpf) {
        return res.status(401).json({ error: 'User authentication failed' });
      }
      
      const { cpf } = req.user;
      const { consent } = req.body;
      
      if (!consent) {
        return res.status(400).json({ error: 'Consent is required' });
      }
      
      const raulApiUrl = process.env.RAUL_API_URL || 'http://localhost:4006';
      
      try {
        await axios.patch(`${raulApiUrl}/open-finance/${cpf}/consent`, { consent: true });
        
        const accountResponse = await axios.get(`${raulApiUrl}/open-finance/${cpf}`);
        
        if (!accountResponse.data) {
          return res.status(404).json({ 
            error: 'Usuário não encontrado na API Raul. Cadastre o usuário primeiro.' 
          });
        }
        
        const accountData = accountResponse.data;
        
        const cpfNumbers = cpf.replace(/\D/g, '');
        const apiHash = 'Raul'.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        let numericId = 0;
        for (let i = 0; i < cpfNumbers.length; i++) {
          numericId = (numericId * 10 + parseInt(cpfNumbers[i])) % 2000000000;
        }
        numericId = (numericId + apiHash * 1000) % 2000000000 + 1000000;
        
        const raulAccount = {
          id: numericId,
          saldo: accountData.balance || 0
        };
        
        const institutionName = accountData.institution || 'Banco Raul';
        
        let transactionsData = accountData.transactions || [];
        
        const account = await OpenFinanceController.createOrUpdateAccount(cpf, raulAccount, institutionName, 'raul');
        
        await OpenFinanceController.syncTransactions(cpf, account.id_bank, transactionsData);
        
        return res.json({ 
          message: 'Conta vinculada com sucesso',
          account: {
            id_bank: account.id_bank,
            balance: account.balance,
            institution_name: account.institution_name
          }
        });
        
      } catch (apiError) {
        console.error('Error connecting to Raul API:', apiError.message);
        return res.status(400).json({ 
          error: 'Erro ao conectar com a API Raul',
          details: apiError.message
        });
      }
      
    } catch (error) {
      console.error('Error linking Raul account:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async linkCaputiAccount(req, res) {
    try {
      if (!req.user || !req.user.cpf) {
        return res.status(401).json({ error: 'User authentication failed' });
      }
      
      const { cpf } = req.user;
      const { consent } = req.body;
      
      if (!consent) {
        return res.status(400).json({ error: 'Consent is required' });
      }
      
      const caputiApiUrl = process.env.CAPUTI_API_URL || 'http://localhost:4001';
      
      try {
        await axios.patch(`${caputiApiUrl}/open-finance/${cpf}/consent`, { consent: true });
        
        const accountResponse = await axios.get(`${caputiApiUrl}/open-finance/${cpf}`);
        
        if (!accountResponse.data) {
          return res.status(404).json({ 
            error: 'Usuário não encontrado na API Caputi. Cadastre o usuário primeiro.' 
          });
        }
        
        const accountData = accountResponse.data;
        
        const cpfNumbers = cpf.replace(/\D/g, '');
        const apiHash = 'Caputi'.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        let numericId = 0;
        for (let i = 0; i < cpfNumbers.length; i++) {
          numericId = (numericId * 10 + parseInt(cpfNumbers[i])) % 2000000000;
        }
        numericId = (numericId + apiHash * 1000) % 2000000000 + 1000000;
        
        const caputiAccount = {
          id: numericId,
          saldo: accountData.balance || 0
        };
        
        const institutionName = accountData.institution || 'Banco Caputi';
        
        const account = await OpenFinanceController.createOrUpdateAccount(cpf, caputiAccount, institutionName, 'caputi');
        
        let transactionsData = accountData.transactions || [];
        
        await OpenFinanceController.syncTransactions(cpf, account.id_bank, transactionsData);
        
        return res.json({ 
          message: 'Conta vinculada com sucesso',
          account: {
            id_bank: account.id_bank,
            balance: account.balance,
            institution_name: account.institution_name
          }
        });
        
      } catch (apiError) {
        console.error('Error connecting to Caputi API:', apiError.message);
        return res.status(400).json({ 
          error: 'Erro ao conectar com a API Caputi',
          details: apiError.message
        });
      }
      
    } catch (error) {
      console.error('Error linking Caputi account:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

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

      const vitorApiUrl = process.env.VITOR_API_URL || `http://localhost:${process.env.VITOR_API_EXT_PORT || '4005'}`;
      
      try {
        const consentResponse = await axios.patch(`${vitorApiUrl}/open-finance/${cpf}/consent`, {
          consent: consent
        }, {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Error updating consent in Vitor API:', {
          message: error.message,
          code: error.code,
          url: `${vitorApiUrl}/open-finance/${cpf}/consent`,
          status: error.response?.status,
          data: error.response?.data
        });
        
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        } else {
          return res.status(400).json({ 
            error: 'Failed to update consent in external API',
            details: error.message
          });
        }
      }

      if (consent) {
        let externalData = null;
        try {
          const response = await axios.get(`${vitorApiUrl}/open-finance/${cpf}`, {
            timeout: 5000,
            headers: {
              'Content-Type': 'application/json'
            }
          });
          externalData = response.data;
        } catch (error) {
          console.error('Error fetching data from Vitor API:', {
            message: error.message,
            status: error.response?.status,
            url: `${vitorApiUrl}/open-finance/${cpf}`,
          });
          
          return res.status(400).json({ 
            error: 'Failed to fetch data from external API',
            details: error.message
          });
        }
        
        if (externalData) {
          let institution = null;
          let institutionName = 'Instituição Desconhecida';
          let bankId = null;
          
          try {
            const institutionResponse = await axios.get(`${vitorApiUrl}/listInstitutions`);
            if (institutionResponse.data && Array.isArray(institutionResponse.data) && institutionResponse.data.length > 0) {
              institution = institutionResponse.data[0];
              institutionName = institution.name;
              bankId = institution.id;
            } else {
              return res.status(400).json({ 
                error: 'Nenhuma instituição encontrada na API do Vitor. Cadastre uma instituição primeiro.' 
              });
            }
          } catch (error) {
            console.error('Error fetching institution from Vitor API:', error.message);
            return res.status(500).json({ 
              error: 'Erro ao buscar instituição da API do Vitor',
              details: error.message 
            });
          }

          let account = await Account.findOne({
            where: { 
              user_cpf: cpf,
              id_bank: bankId
            }
          });

          if (account) {
            account.balance = externalData.balance;
            account.consent = true;
            account.institution_name = institutionName;
            account.api_source = 'vitor';
            await account.save();
          } else {
            account = await Account.create({
              user_cpf: cpf,
              id_bank: bankId,
              balance: externalData.balance,
              consent: true,
              institution_name: institutionName,
              api_source: 'vitor'
            });
          }

          if (externalData.transactions && externalData.transactions.length > 0) {
            const existingTransactions = await Transaction.findAll({
              where: {
                id_bank: bankId,
                [Op.or]: [
                  { origin_cpf: cpf },
                  { destination_cpf: cpf }
                ]
              },
              attributes: ['description', 'category', 'created_at', 'value']
            });

            await Transaction.destroy({
              where: {
                id_bank: bankId,
                [Sequelize.Op.or]: [
                  { origin_cpf: cpf },
                  { destination_cpf: cpf }
                ]
              }
            });

            const existingTransactionsMap = new Map();

            
            existingTransactions.forEach(t => {
              const normalizedValue = Math.abs(parseFloat(t.value.toString().replace(/[^\d.-]/g, '')));
              
              let normalizedDate;
              try {
                const date = new Date(t.created_at);
                if (isNaN(date.getTime())) {
                  const dateStr = t.created_at.toString();
                  const dateMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
                  if (dateMatch) {
                    normalizedDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
                  } else {
                    normalizedDate = new Date().toISOString().split('T')[0];
                  }
                } else {
                  normalizedDate = date.toISOString().split('T')[0];
                }
              } catch (e) {
                normalizedDate = new Date().toISOString().split('T')[0];
              }
              
              const key = `${t.description}_${normalizedDate}_${normalizedValue}`;
              
              if (t.category && t.category !== 'Não classificado') {
                existingTransactionsMap.set(key, t.category);

              }
            });

            const transactionsToInsert = externalData.transactions.map(transaction => {
              const normalizedValue = Math.abs(parseFloat(transaction.value.toString().replace(/[^\d.-]/g, '')));
              
              let normalizedDate;
              try {
                const date = new Date(transaction.date);
                if (isNaN(date.getTime())) {
                  const dateStr = transaction.date.toString();
                  const dateMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
                  if (dateMatch) {
                    normalizedDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
                  } else {
                    normalizedDate = new Date().toISOString().split('T')[0];
                  }
                } else {
                  normalizedDate = date.toISOString().split('T')[0];
                }
              } catch (e) {
                normalizedDate = new Date().toISOString().split('T')[0];
              }
              
              const transactionKey = `${transaction.description}_${normalizedDate}_${normalizedValue}`;
              
              const existingCategory = existingTransactionsMap.get(transactionKey);
              
              return {
                origin_cpf: transaction.type === 'debit' ? cpf : transaction.origin_cpf || null,
                destination_cpf: transaction.type === 'credit' ? cpf : transaction.destination_cpf || null,
                value: Math.abs(parseFloat(transaction.value.toString().replace(/[^\d.-]/g, ''))),
                type: transaction.type === 'debit' ? 'D' : 'C',
                description: transaction.description,
                id_bank: bankId,
                category: existingCategory || 'Não classificado',
                created_at: new Date(transaction.date)
              };
            });

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
        await Account.update(
          { consent: false },
          { 
            where: { 
              user_cpf: cpf,
              id_bank: bankId
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

      const connectedAccounts = linkedAccounts.map(account => ({
        id: account.id_bank,
        name: account.institution_name || `Instituição ${account.id_bank}`,
        balance: parseFloat(account.balance) || 0,
        connected: true,
        lastSync: account.updated_at,
        api_source: account.api_source || 'vitor'
      }));
      
      const response = {
        accounts: connectedAccounts,
        count: connectedAccounts.length
      };
      
      return res.json(response);
    } catch (error) {
      console.error('Error getting connected accounts:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async disconnectAccount(req, res) {
    try {
      if (!req.user || !req.user.cpf) {
        return res.status(401).json({ error: 'User authentication failed' });
      }
      
      const { cpf } = req.user;
      const { id_bank } = req.params;

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

  static async disconnectAllAccounts(req, res) {
    try {
      if (!req.user || !req.user.cpf) {
        return res.status(401).json({ error: 'User authentication failed' });
      }
      
      const { cpf } = req.user;

      await Account.update(
        { consent: false },
        { 
          where: { 
            user_cpf: cpf
          }
        }
      );

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

  static async syncAccount(req, res) {
    try {
      if (!req.user || !req.user.cpf) {
        return res.status(401).json({ error: 'User authentication failed' });
      }

      const { id_bank: rawid_bank } = req.params;
      const { cpf } = req.user;

      const id_bank = parseInt(rawid_bank);
      if (isNaN(id_bank)) {
        return res.status(400).json({ error: 'Invalid bank ID' });
      }

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

      const apiSource = account.api_source || 'vitor';
      let externalData;
      let institutionName = account.institution_name || 'Instituição';
      
      try {
        if (apiSource === 'lucas') {
          const lucasApiUrl = process.env.LUCAS_API_URL || 'http://localhost:4003';
          
          const saldoResponse = await axios.get(`${lucasApiUrl}/usuarios/${cpf}/saldo`);
          
          if (!saldoResponse.data) {
            return res.status(404).json({ error: 'No data found for this user in Lucas API' });
          }
          
          let transactions = [];
          try {
            const transacoesResponse = await axios.get(`${lucasApiUrl}/usuarios/${cpf}/transacoes`);
            transactions = transacoesResponse.data.transacoes || [];
          } catch (transError) {
          }
          
          externalData = {
            balance: saldoResponse.data.saldoTotal || 0,
            transactions: transactions
          };
          
        } else if (apiSource === 'patricia') {
          const patriciaApiUrl = process.env.PATRICIA_API_URL || 'http://localhost:4004';
          
          const response = await axios.get(`${patriciaApiUrl}/open-finance/${cpf}`);
          
          externalData = {
            balance: response.data.balance || 0,
            transactions: response.data.transactions || []
          };
          
        } else if (apiSource === 'dante') {
          const danteApiUrl = process.env.DANTE_API_URL || 'http://localhost:4002';
          
          const response = await axios.get(`${danteApiUrl}/open-finance/${cpf}`);
          
          externalData = {
            balance: response.data.balance || 0,
            transactions: response.data.transactions || []
          };
          
        } else if (apiSource === 'raul') {
          const raulApiUrl = process.env.RAUL_API_URL || 'http://localhost:4006';
          
          const response = await axios.get(`${raulApiUrl}/open-finance/${cpf}`);
          
          externalData = {
            balance: response.data.balance || 0,
            transactions: response.data.transactions || []
          };
          
        } else if (apiSource === 'caputi') {
          const caputiApiUrl = process.env.CAPUTI_API_URL || 'http://localhost:4001';
          
          const response = await axios.get(`${caputiApiUrl}/open-finance/${cpf}`);
          
          externalData = {
            balance: response.data.balance || 0,
            transactions: response.data.transactions || []
          };
          
        } else {
          const vitorApiUrl = process.env.VITOR_API_URL || `http://localhost:${process.env.VITOR_API_EXT_PORT || '4005'}`;
          
          const response = await axios.get(`${vitorApiUrl}/open-finance/${cpf}`);
          externalData = response.data;
        }
        
      } catch (apiError) {
        console.error(`Error fetching data from ${institutionName} API:`, apiError.message);
        return res.status(500).json({ 
          error: `Failed to sync with ${institutionName}`,
          details: apiError.message 
        });
      }
        
        if (!externalData) {
          return res.status(404).json({ error: 'No data found for this user' });
        }
        
        const oldBalance = account.balance;
        const newBalance = parseFloat(externalData.balance) || 0;
        await account.update({
          balance: newBalance,
          updated_at: new Date()
        });
      
        let newTransactionsCount = 0;
        if (externalData.transactions && externalData.transactions.length > 0) {
          const existingTransactions = await Transaction.findAll({
            where: {
              id_bank: id_bank,
              [Op.or]: [
                { origin_cpf: cpf },
                { destination_cpf: cpf }
              ]
            },
            attributes: ['description', 'category', 'created_at', 'value']
          });

          const existingTransactionsMap = new Map();

          
          existingTransactions.forEach(t => {
             const normalizedValue = Math.abs(parseFloat(t.value.toString().replace(/[^\d.-]/g, '')));
             
             let normalizedDate;
             try {
               const date = new Date(t.created_at);
               if (isNaN(date.getTime())) {
                 const dateStr = t.created_at.toString();
                 const dateMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
                 if (dateMatch) {
                   normalizedDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
                 } else {
                   normalizedDate = new Date().toISOString().split('T')[0];
                 }
               } else {
                 normalizedDate = date.toISOString().split('T')[0];
               }
             } catch (e) {
               normalizedDate = new Date().toISOString().split('T')[0];
             }
             
             const key = `${t.description}_${normalizedDate}_${normalizedValue}`;
             
             if (t.category && t.category !== 'Não classificado') {
               existingTransactionsMap.set(key, t.category);
             }
           });

          await Transaction.destroy({
            where: {
              id_bank: id_bank,
              [Sequelize.Op.or]: [
                { origin_cpf: cpf },
                { destination_cpf: cpf }
              ]
            }
          });
          
           const transactionsToCreate = externalData.transactions.map(transaction => {
             const normalizedValue = Math.abs(parseFloat(transaction.value.toString().replace(/[^\d.-]/g, '')));
             
             let normalizedDate;
             try {
               const date = new Date(transaction.date);
               if (isNaN(date.getTime())) {
                 const dateStr = transaction.date.toString();
                 const dateMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
                 if (dateMatch) {
                   normalizedDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
                 } else {
                   normalizedDate = new Date().toISOString().split('T')[0];
                 }
               } else {
                 normalizedDate = date.toISOString().split('T')[0];
               }
             } catch (e) {
               normalizedDate = new Date().toISOString().split('T')[0];
             }
             
             const transactionKey = `${transaction.description}_${normalizedDate}_${normalizedValue}`;
             
             const existingCategory = existingTransactionsMap.get(transactionKey);

            const isCredit = transaction.type === 'credit' || 
                            transaction.tipo === 'credito' || 
                            transaction.type === 'entrada' ||
                            transaction.tipo === 'entrada'; 
            
            const isDebit = transaction.type === 'saida' || 
                           transaction.tipo === 'saida' ||
                           transaction.type === 'debit' ||
                           transaction.tipo === 'debito';
            
            const finalType = isCredit ? 'C' : 'D';
            

            return {
              origin_cpf: finalType === 'D' ? cpf : null,
              destination_cpf: finalType === 'C' ? cpf : null,
              value: Math.abs(parseFloat(transaction.valor || transaction.value || 0)),
              type: finalType,
              description: transaction.descricao || transaction.description || 'Transação',
              id_bank: id_bank,
              category: existingCategory || 'Não classificado',
              created_at: new Date(transaction.data || transaction.date || transaction.createdAt)
            };
          });
          
          await Transaction.bulkCreate(transactionsToCreate);
          newTransactionsCount = transactionsToCreate.length;
        }
        
        return res.json({
          message: 'Account synchronized successfully',
          newBalance: newBalance,
          newTransactionsCount: newTransactionsCount,
          lastSync: new Date().toISOString(),
          balance: newBalance
        });
        
    } catch (error) {
      console.error('Error syncing account:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async listAvailableInstitutions(req, res) {
    try {
      const institutions = [];
      
      const apis = [
        {
          name: 'API Lucas',
          url: process.env.LUCAS_API_URL || 'http://localhost:4003',
          linkEndpoint: '/open-finance/link-lucas'
        },
        {
          name: 'API Vitor',
          url: process.env.VITOR_API_URL || `http://localhost:${process.env.VITOR_API_EXT_PORT || '4005'}`,
          linkEndpoint: '/open-finance/link-vitor'
        },
        {
          name: 'API Patricia',
          url: process.env.PATRICIA_API_URL || 'http://localhost:4004',
          linkEndpoint: '/open-finance/link-patricia'
        },
        {
          name: 'API Dante',
          url: process.env.DANTE_API_URL || 'http://localhost:4006',
          linkEndpoint: '/open-finance/link-dante'
        },
        {
          name: 'API Raul',
          url: process.env.RAUL_API_URL || 'http://localhost:4006',
          linkEndpoint: '/open-finance/link-raul'
        }
      ];
      
      for (const api of apis) {
        try {
          await axios.get(`${api.url}/health`, { timeout: 2000 });
          institutions.push({
            id: api.name.toLowerCase().replace(/\s+/g, '-'),
            name: api.name,
            status: 'available',
            linkEndpoint: api.linkEndpoint
          });
        } catch (apiError) {
          institutions.push({
            id: api.name.toLowerCase().replace(/\s+/g, '-'),
            name: api.name,
            status: 'unavailable',
            linkEndpoint: api.linkEndpoint
          });
        }
      }
      
      return res.json({ institutions });
    } catch (error) {
      console.error('Error listing available institutions:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getUserTransactions(req, res) {
    try {
      if (!req.user || !req.user.cpf) {
        return res.status(401).json({ error: 'User authentication failed' });
      }
      
      const { cpf } = req.user;
      
      const transactions = await Transaction.findAll({
        where: {
          [Sequelize.Op.or]: [
            { origin_cpf: cpf },
            { destination_cpf: cpf }
          ]
        },
        order: [['created_at', 'DESC']],
        limit: 100
      });

      const formattedTransactions = transactions.map(transaction => {
        const isCredit = transaction.destination_cpf === cpf;
        const transactionDate = transaction.created_at || transaction.updatedAt || new Date();
        
        return {
          id: transaction.id,
          title: transaction.description || 'Transação',
          category: transaction.category || 'Não classificado',
          type: isCredit ? 'C' : 'D',
          amount: parseFloat(transaction.value),
          date: transactionDate.toISOString().split('T')[0],
          origin_cpf: transaction.origin_cpf,
          destination_cpf: transaction.destination_cpf,
          id_bank: transaction.id_bank
        };
      });

      return res.json({
        transactions: formattedTransactions,
        total: formattedTransactions.length
      });
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateTransactionCategory(req, res) {
    try {
      const { id } = req.params;
      const { category } = req.body;
      
      if (!req.user || !req.user.cpf) {
        return res.status(401).json({ error: 'User authentication failed' });
      }

      const { cpf } = req.user;

      const transaction = await Transaction.findOne({
        where: {
          id: id,
          [Op.or]: [
            { origin_cpf: cpf },
            { destination_cpf: cpf }
          ]
        }
      });

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      await transaction.update({ category });

      return res.json({
        success: true,
        message: 'Transaction category updated successfully',
        transaction: {
          id: transaction.id,
          category: transaction.category
        }
      });
    } catch (error) {
      console.error('Error updating transaction category:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getBudgets(req, res) {
    try {
      if (!req.user || !req.user.cpf) {
        return res.status(401).json({ error: 'User authentication failed' });
      }

      const { cpf } = req.user;
      const { month, year } = req.query;

      const currentDate = new Date();
      const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
      const targetYear = year ? parseInt(year) : currentDate.getFullYear();

      const budgets = await Budget.findAll({
        where: {
          user_cpf: cpf,
          month: targetMonth,
          year: targetYear
        }
      });

      return res.json({
        success: true,
        budgets: budgets.map(budget => ({
          id: budget.id,
          category: budget.category,
          limit_amount: parseFloat(budget.limit_amount),
          month: budget.month,
          year: budget.year
        }))
      });
    } catch (error) {
      console.error('Error fetching budgets:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async saveBudget(req, res) {
    try {
      if (!req.user || !req.user.cpf) {
        return res.status(401).json({ error: 'User authentication failed' });
      }

      const { cpf } = req.user;
      const { category, limit } = req.body;

      if (!category || !limit || limit <= 0) {
        return res.status(400).json({ error: 'Category and valid limit are required' });
      }

      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      const existingBudget = await Budget.findOne({
        where: {
          user_cpf: cpf,
          category: category,
          month: month,
          year: year
        }
      });

      let budget;
      if (existingBudget) {
        await existingBudget.update({ limit_amount: limit });
        budget = existingBudget;
      } else {
        budget = await Budget.create({
          user_cpf: cpf,
          category: category,
          limit_amount: limit,
          month: month,
          year: year
        });
      }

      return res.json({
        success: true,
        message: 'Budget saved successfully',
        budget: {
          id: budget.id,
          category: budget.category,
          limit_amount: parseFloat(budget.limit_amount),
          month: budget.month,
          year: budget.year
        }
      });
    } catch (error) {
      console.error('Error saving budget:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deleteBudget(req, res) {
    try {
      if (!req.user || !req.user.cpf) {
        return res.status(401).json({ error: 'User authentication failed' });
      }

      const { cpf } = req.user;
      const { id } = req.params;

      const budget = await Budget.findOne({
        where: {
          id: id,
          user_cpf: cpf
        }
      });

      if (!budget) {
        return res.status(404).json({ error: 'Budget not found' });
      }

      await budget.destroy();

      return res.json({
        success: true,
        message: 'Budget deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting budget:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = OpenFinanceController;