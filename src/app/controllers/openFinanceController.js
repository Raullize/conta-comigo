const axios = require('axios');
const { Sequelize, Op } = require('sequelize');
const sequelize = require('../../database/database.js');
const {
  models: { Account, Transaction, User },
} = require('../../database');
const Budget = require('../models/Budget');
const crypto = require('crypto');

class OpenFinanceController {
  // Função auxiliar para criar ou atualizar conta
  static async createOrUpdateAccount(cpf, accountData, institutionName, apiSource = 'vitor') {
    let account = await Account.findOne({
      where: { 
        user_cpf: cpf,
        id_bank: accountData.id
      }
    });

    if (account) {
      // Atualiza conta existente
      account.balance = accountData.balance || accountData.saldo || 0;
      account.consent = true;
      account.institution_name = institutionName;
      account.api_source = apiSource;
      account.updated_at = new Date();
      await account.save();
    } else {
      // Cria nova conta
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

  // Função auxiliar para sincronizar transações
  static async syncTransactions(cpf, accountId, transactions) {
    console.log(`[DEBUG syncTransactions] CPF: ${cpf}, AccountID: ${accountId}, Transações recebidas: ${transactions ? transactions.length : 0}`);
    
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      console.log(`[DEBUG syncTransactions] Nenhuma transação para sincronizar`);
      return;
    }

    // Remove transações antigas desta conta
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
      // Determinar se é crédito ou débito - compatível com múltiplas APIs
      const isCredit = transaction.type === 'credit' || 
                      transaction.tipo === 'credito' || 
                      transaction.type === 'entrada' ||
                      transaction.tipo === 'entrada'; // API Caputi, Lucas e Raul - ENTRADA = CRÉDITO
      
      // Para todas as APIs: "saida" = débito, "entrada" = crédito
      const isDebit = transaction.type === 'saida' || 
                     transaction.tipo === 'saida' ||
                     transaction.type === 'debit' ||
                     transaction.tipo === 'debito';
      
      // Lógica unificada: se é crédito, então 'C', senão 'D'
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

  // Vincula uma conta da API do Lucas
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
      
      // URL da API do Lucas
      const lucasApiUrl = process.env.LUCAS_API_URL || 'http://localhost:4003';
      
      try {
        const axios = require('axios');
        
        // Buscar dados do usuário na API do Lucas
        const userResponse = await axios.get(`${lucasApiUrl}/usuarios/${cpf}`);
        
        if (!userResponse.data) {
          return res.status(404).json({ 
            error: 'Usuário não encontrado na API do Lucas. Cadastre o usuário primeiro.' 
          });
        }
        
        // Buscar contas do usuário (a API do Lucas não tem endpoint específico para contas por usuário)
        // Vamos usar o endpoint de saldo que retorna informações da conta
        const saldoResponse = await axios.get(`${lucasApiUrl}/usuarios/${cpf}/saldo`);
        
        if (!saldoResponse.data) {
          return res.status(404).json({ 
            error: 'Nenhuma conta encontrada na API do Lucas. Cadastre uma conta primeiro.' 
          });
        }
        
        // Gerar um ID numérico único baseado no CPF para a conta do Lucas
        // Usando uma abordagem que garante que o número caiba no INTEGER (máximo 2,147,483,647)
        const cpfNumbers = cpf.replace(/\D/g, ''); // Remove caracteres não numéricos
        let numericId = 0;
        for (let i = 0; i < cpfNumbers.length; i++) {
          numericId = (numericId * 10 + parseInt(cpfNumbers[i])) % 2000000000; // Mantém abaixo do limite
        }
        numericId = numericId + 1000000; // Adiciona offset para evitar IDs muito pequenos
        
        // Criar objeto de conta baseado no saldo retornado
        const lucasAccount = {
          id: numericId, // ID numérico único baseado no CPF
          saldo: saldoResponse.data.saldoTotal || 0
        };
        
        // Buscar transações da API do Lucas
        let transactionsData = [];
        try {
          const transacoesResponse = await axios.get(`${lucasApiUrl}/usuarios/${cpf}/transacoes`);
          transactionsData = transacoesResponse.data.transacoes || [];
        } catch (transError) {
          // Ignorar erro de transações
        }
        
        let institutionName = null;
        
        if (saldoResponse.data.instituicao && Array.isArray(saldoResponse.data.instituicao) && saldoResponse.data.instituicao.length > 0) {
          institutionName = saldoResponse.data.instituicao[0].nomeInstituicao;
        }
        
        if (!institutionName) {
          return res.status(400).json({ error: 'Nome da instituição não encontrado na API Lucas' });
        }
        
        // Usar função auxiliar para criar/atualizar conta
        const account = await OpenFinanceController.createOrUpdateAccount(cpf, lucasAccount, institutionName, 'lucas');
        
        // Usar função auxiliar para sincronizar transações
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

  // Função genérica para vincular contas de diferentes APIs
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
        // Tentar buscar dados do usuário - APIs novas usam /users, antigas usam /usuarios
        let userResponse;
        try {
          // Primeiro tenta endpoint moderno /users (Patricia, Raul)
          userResponse = await axios.get(`${apiUrl}/users/${cpf}`);
        } catch (error) {
          // Se falhar, tenta endpoint legado /usuarios (outras APIs)
          userResponse = await axios.get(`${apiUrl}/usuarios/${cpf}`);
        }
        
        if (!userResponse.data) {
          return res.status(404).json({ 
            error: `Usuário não encontrado na API ${apiName}. Cadastre o usuário primeiro.` 
          });
        }
        
        // Buscar contas do usuário - APIs modernas têm endpoint específico
        let accountsResponse;
        try {
          // Tentar endpoint de contas moderno
          accountsResponse = await axios.get(`${apiUrl}/users/${cpf}/accounts`);
        } catch (error) {
          // Se não tiver, usar dados do usuário diretamente
          accountsResponse = { data: [] };
        }
        
        // Buscar saldo total se API suportar
        let balanceData = 0;
        try {
          const balanceResponse = await axios.get(`${apiUrl}/users/${cpf}/balance`);
          balanceData = balanceResponse.data.totalBalance || balanceResponse.data.saldo || 0;
        } catch (error) {
          // Se não tiver endpoint de saldo, usar dados das contas ou usuário
          if (accountsResponse.data && accountsResponse.data.length > 0) {
            balanceData = accountsResponse.data.reduce((total, account) => {
              return total + parseFloat(account.balance || account.saldo || 0);
            }, 0);
          } else {
            balanceData = userResponse.data.saldo || userResponse.data.balance || 0;
          }
        }
        
        // Gerar um ID numérico único baseado no CPF e no nome da API
        const cpfNumbers = cpf.replace(/\D/g, '');
        const apiHash = apiName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        let numericId = 0;
        for (let i = 0; i < cpfNumbers.length; i++) {
          numericId = (numericId * 10 + parseInt(cpfNumbers[i])) % 2000000000;
        }
        numericId = (numericId + apiHash * 1000) % 2000000000 + 1000000;
        
        // Criar objeto de conta baseado nos dados retornados
        const accountData = {
          id: numericId,
          saldo: balanceData
        };
        
        // Buscar transações se disponível
        let transactionsData = [];
        try {
          // Tentar endpoint moderno de transações
          const transactionsResponse = await axios.get(`${apiUrl}/users/${cpf}/transactions`);
          transactionsData = transactionsResponse.data.transactions || transactionsResponse.data || [];
        } catch (error) {
          try {
            // Tentar endpoint legado de transações
            const transactionsResponse = await axios.get(`${apiUrl}/usuarios/${cpf}/transacoes`);
            transactionsData = transactionsResponse.data.transacoes || transactionsResponse.data.transactions || [];
          } catch (transError) {
            // Endpoint de transações não disponível
            console.log(`[${apiName}] Endpoint de transações não disponível`);
          }
        }
        
        console.log(`[${apiName}] Encontradas ${transactionsData.length} transações para CPF ${cpf}`);
        
        // Usar função auxiliar para criar/atualizar conta
        const apiSource = apiName.toLowerCase();
        const account = await OpenFinanceController.createOrUpdateAccount(cpf, accountData, institutionName, apiSource);
        
        // Usar função auxiliar para sincronizar transações
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

  // Vincula uma conta da API da Patricia
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
        // Primeiro, atualizar o consentimento na API Patricia
        await axios.patch(`${patriciaApiUrl}/open-finance/${cpf}/consent`, { consent: true });
        
        // Buscar dados da conta usando o endpoint específico de Open Finance
        const accountResponse = await axios.get(`${patriciaApiUrl}/open-finance/${cpf}`);
        
        if (!accountResponse.data) {
          return res.status(404).json({ 
            error: 'Usuário não encontrado na API Patricia. Cadastre o usuário primeiro.' 
          });
        }
        
        const accountData = accountResponse.data;
        
        // Criar objeto de conta baseado nos dados retornados da API Patricia
        const patriciaAccount = {
          id: accountData.id_bank || 4, // Patricia API é banco 4
          saldo: accountData.balance || 0
        };
        
        // Usar o nome da instituição retornado pela API Patricia
        const institutionName = accountData.institution || 'Banco Patricia';
        
        // Usar função auxiliar para criar/atualizar conta
        const account = await OpenFinanceController.createOrUpdateAccount(cpf, patriciaAccount, institutionName, 'patricia');
        
        // Buscar transações se disponível
        let transactionsData = accountData.transactions || [];
        
        // Usar função auxiliar para sincronizar transações
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

  // Vincula uma conta da API do Dante
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
        // Usar o endpoint específico do Open Finance da API Dante
        const userResponse = await axios.get(`${danteApiUrl}/open-finance/${cpf}`);
        
        if (!userResponse.data) {
          return res.status(404).json({ 
            error: 'Usuário não encontrado na API Dante. Cadastre o usuário primeiro.' 
          });
        }
        
        // Gerar um ID numérico único baseado no CPF para Dante
        const cpfNumbers = cpf.replace(/\D/g, '');
        const apiHash = 'Dante'.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        let numericId = 0;
        for (let i = 0; i < cpfNumbers.length; i++) {
          numericId = (numericId * 10 + parseInt(cpfNumbers[i])) % 2000000000;
        }
        numericId = (numericId + apiHash * 1000) % 2000000000 + 1000000;
        
        // Criar objeto de conta baseado nos dados retornados
        const accountData = {
          id: numericId,
          saldo: userResponse.data.saldoTotal || userResponse.data.balance || 0
        };
        
        // Buscar transações se disponível
        let transactionsData = [];
        if (userResponse.data.transactions) {
          transactionsData = userResponse.data.transactions;
        }
        
        // Usar o nome da instituição retornado pela API ou fallback para "Banco Dante"
        const institutionName = userResponse.data.institution || 'Banco Dante';
        
        // Usar função auxiliar para criar/atualizar conta
        const account = await OpenFinanceController.createOrUpdateAccount(cpf, accountData, institutionName, 'dante');
        
        // Usar função auxiliar para sincronizar transações
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

  // Vincula uma conta da API do Raul
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
        // Primeiro, atualizar o consentimento na API Raul
        await axios.patch(`${raulApiUrl}/open-finance/${cpf}/consent`, { consent: true });
        
        // Buscar dados da conta usando o endpoint específico de Open Finance
        const accountResponse = await axios.get(`${raulApiUrl}/open-finance/${cpf}`);
        
        if (!accountResponse.data) {
          return res.status(404).json({ 
            error: 'Usuário não encontrado na API Raul. Cadastre o usuário primeiro.' 
          });
        }
        
        const accountData = accountResponse.data;
        
        // Gerar um ID numérico único baseado no CPF para Raul
        const cpfNumbers = cpf.replace(/\D/g, '');
        const apiHash = 'Raul'.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        let numericId = 0;
        for (let i = 0; i < cpfNumbers.length; i++) {
          numericId = (numericId * 10 + parseInt(cpfNumbers[i])) % 2000000000;
        }
        numericId = (numericId + apiHash * 1000) % 2000000000 + 1000000;
        
        // Criar objeto de conta baseado nos dados retornados da API Raul
        const raulAccount = {
          id: numericId, // ID único baseado no CPF e API
          saldo: accountData.balance || 0
        };
        
        // Usar o nome da instituição retornado pela API Raul
        const institutionName = accountData.institution || 'Banco Raul';
        
        // Buscar transações se disponível
        let transactionsData = accountData.transactions || [];
        
        // Usar função auxiliar para criar/atualizar conta
        const account = await OpenFinanceController.createOrUpdateAccount(cpf, raulAccount, institutionName, 'raul');
        
        // Usar função auxiliar para sincronizar transações
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

  // Vincula uma conta da API do Caputi
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
        // Primeiro, atualizar o consentimento na API Caputi
        await axios.patch(`${caputiApiUrl}/open-finance/${cpf}/consent`, { consent: true });
        
        // Buscar dados da conta usando o endpoint específico de Open Finance
        const accountResponse = await axios.get(`${caputiApiUrl}/open-finance/${cpf}`);
        
        if (!accountResponse.data) {
          return res.status(404).json({ 
            error: 'Usuário não encontrado na API Caputi. Cadastre o usuário primeiro.' 
          });
        }
        
        const accountData = accountResponse.data;
        
        // Gerar um ID numérico único baseado no CPF para Caputi
        const cpfNumbers = cpf.replace(/\D/g, '');
        const apiHash = 'Caputi'.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        let numericId = 0;
        for (let i = 0; i < cpfNumbers.length; i++) {
          numericId = (numericId * 10 + parseInt(cpfNumbers[i])) % 2000000000;
        }
        numericId = (numericId + apiHash * 1000) % 2000000000 + 1000000;
        
        // Criar objeto de conta baseado nos dados retornados da API Caputi
        const caputiAccount = {
          id: numericId, // ID único baseado no CPF e API
          saldo: accountData.balance || 0
        };
        
        // Usar o nome da instituição retornado pela API Caputi
        const institutionName = accountData.institution || 'Banco Caputi';
        
        // Usar função auxiliar para criar/atualizar conta
        const account = await OpenFinanceController.createOrUpdateAccount(cpf, caputiAccount, institutionName, 'caputi');
        
        // Buscar transações se disponível
        let transactionsData = accountData.transactions || [];
        
        // Usar função auxiliar para sincronizar transações
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

  // Vincula uma conta da API do Vitor (id_bank dinâmico)
  static async linkVitorAccount(req, res) {
    try {
      if (!req.user || !req.user.cpf) {
        return res.status(401).json({ error: 'User authentication failed' });
      }
      
      const { cpf } = req.user;
      const { consent } = req.body;
      
      // Não usar ID fixo - buscar instituições dinamicamente

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
          // Buscar a instituição da API do Vitor
          let institution = null;
          let institutionName = 'Instituição Desconhecida';
          let bankId = null;
          
          try {
            const institutionResponse = await axios.get(`${vitorApiUrl}/listInstitutions`);
            if (institutionResponse.data && Array.isArray(institutionResponse.data) && institutionResponse.data.length > 0) {
              // Pegar a primeira instituição disponível (já que a API do Vitor permite apenas uma)
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

          // Verifica se a conta já existe
          let account = await Account.findOne({
            where: { 
              user_cpf: cpf,
              id_bank: bankId
            }
          });

          if (account) {
            // Atualiza conta existente
            account.balance = externalData.balance;
            account.consent = true;
            account.institution_name = institutionName;
            account.api_source = 'vitor';
            await account.save();
          } else {
            // Cria nova conta
            account = await Account.create({
              user_cpf: cpf,
              id_bank: bankId,
              balance: externalData.balance,
              consent: true,
              institution_name: institutionName,
              api_source: 'vitor'
            });
          }

          // Sincroniza transações
          if (externalData.transactions && externalData.transactions.length > 0) {
            // PRIMEIRO: Buscar transações existentes para preservar categorias (ANTES de remover)
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

            // SEGUNDO: Remove transações antigas desta conta
            await Transaction.destroy({
              where: {
                id_bank: bankId,
                [Sequelize.Op.or]: [
                  { origin_cpf: cpf },
                  { destination_cpf: cpf }
                ]
              }
            });

            // Criar mapa de transações existentes para preservar categorias
            const existingTransactionsMap = new Map();

            
            existingTransactions.forEach(t => {
              // Normalizar valores para comparação consistente
              const normalizedValue = Math.abs(parseFloat(t.value.toString().replace(/[^\d.-]/g, '')));
              
              // Normalizar data de forma consistente - sempre usar YYYY-MM-DD se possível
              let normalizedDate;
              try {
                const date = new Date(t.created_at);
                if (isNaN(date.getTime())) {
                  // Se a data é inválida, tentar extrair da string
                  const dateStr = t.created_at.toString();
                  const dateMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
                  if (dateMatch) {
                    normalizedDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
                  } else {
                    // Se não conseguir extrair, usar data atual como fallback
                    normalizedDate = new Date().toISOString().split('T')[0];
                  }
                } else {
                  normalizedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
                }
              } catch (e) {
                normalizedDate = new Date().toISOString().split('T')[0];
              }
              
              const key = `${t.description}_${normalizedDate}_${normalizedValue}`;
              
              if (t.category && t.category !== 'Não classificado') {
                existingTransactionsMap.set(key, t.category);

              }
            });

             // Insere novas transações preservando categorias existentes
            const transactionsToInsert = externalData.transactions.map(transaction => {
              // Normalizar valores da mesma forma
              const normalizedValue = Math.abs(parseFloat(transaction.value.toString().replace(/[^\d.-]/g, '')));
              
              // Normalizar data de forma consistente - sempre usar YYYY-MM-DD se possível
              let normalizedDate;
              try {
                const date = new Date(transaction.date);
                if (isNaN(date.getTime())) {
                  // Se a data é inválida, tentar extrair da string
                  const dateStr = transaction.date.toString();
                  const dateMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
                  if (dateMatch) {
                    normalizedDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
                  } else {
                    // Se não conseguir extrair, usar data atual como fallback
                    normalizedDate = new Date().toISOString().split('T')[0];
                  }
                } else {
                  normalizedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
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
        // Se o consentimento foi revogado, atualiza apenas o status
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
      if (isNaN(id_bank)) {
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

      // Determinar qual API usar baseado no api_source
      const apiSource = account.api_source || 'vitor';
      let externalData;
      let institutionName = account.institution_name || 'Instituição';
      
      try {
        if (apiSource === 'lucas') {
          // Sincronizar com a API do Lucas
          const lucasApiUrl = process.env.LUCAS_API_URL || 'http://localhost:4003';
          
          // Buscar saldo atualizado da API do Lucas
          const saldoResponse = await axios.get(`${lucasApiUrl}/usuarios/${cpf}/saldo`);
          
          if (!saldoResponse.data) {
            return res.status(404).json({ error: 'No data found for this user in Lucas API' });
          }
          
          // Buscar transações da API do Lucas
          let transactions = [];
          try {
            const transacoesResponse = await axios.get(`${lucasApiUrl}/usuarios/${cpf}/transacoes`);
            transactions = transacoesResponse.data.transacoes || [];
          } catch (transError) {
            // Ignorar erro de transações
          }
          
          externalData = {
            balance: saldoResponse.data.saldoTotal || 0,
            transactions: transactions
          };
          
        } else if (apiSource === 'patricia') {
          // Sincronizar com a API da Patricia
          const patriciaApiUrl = process.env.PATRICIA_API_URL || 'http://localhost:4004';
          
          // Buscar dados da API da Patricia (adaptar conforme endpoints disponíveis)
          const response = await axios.get(`${patriciaApiUrl}/open-finance/${cpf}`);
          
          externalData = {
            balance: response.data.balance || 0,
            transactions: response.data.transactions || []
          };
          
        } else if (apiSource === 'dante') {
          // Sincronizar com a API do Dante - usar endpoint correto
          const danteApiUrl = process.env.DANTE_API_URL || 'http://localhost:4002';
          
          // Buscar dados da API do Dante usando endpoint de open-finance
          const response = await axios.get(`${danteApiUrl}/open-finance/${cpf}`);
          
          externalData = {
            balance: response.data.balance || 0,
            transactions: response.data.transactions || []
          };
          
        } else if (apiSource === 'raul') {
          // Sincronizar com a API do Raul
          const raulApiUrl = process.env.RAUL_API_URL || 'http://localhost:4006';
          
          // Usar o endpoint Open Finance da API Raul
          const response = await axios.get(`${raulApiUrl}/open-finance/${cpf}`);
          
          externalData = {
            balance: response.data.balance || 0,
            transactions: response.data.transactions || []
          };
          
        } else if (apiSource === 'caputi') {
          // Sincronizar com a API do Caputi
          const caputiApiUrl = process.env.CAPUTI_API_URL || 'http://localhost:4001';
          
          // Buscar dados da API do Caputi usando endpoint de open-finance
          const response = await axios.get(`${caputiApiUrl}/open-finance/${cpf}`);
          
          externalData = {
            balance: response.data.balance || 0,
            transactions: response.data.transactions || []
          };
          
        } else {
          // Sincronizar com a API do Vitor (padrão)
          const vitorApiUrl = process.env.VITOR_API_URL || `http://localhost:${process.env.VITOR_API_EXT_PORT || '4005'}`;
          
          // Buscar dados atualizados da API do Vitor
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
        
        // Atualizar saldo da conta
        const oldBalance = account.balance;
        const newBalance = parseFloat(externalData.balance) || 0;
        await account.update({
          balance: newBalance,
          updated_at: new Date()
        });
        

        
        // Importar novas transações
        let newTransactionsCount = 0;
        if (externalData.transactions && externalData.transactions.length > 0) {
          // PRIMEIRO: Buscar transações existentes para preservar categorias (ANTES de remover)
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

          // Criar mapa de transações existentes para preservar categorias
          const existingTransactionsMap = new Map();

          
          existingTransactions.forEach(t => {
             // Normalizar valores para comparação consistente (consistente com syncAccount)
             const normalizedValue = Math.abs(parseFloat(t.value.toString().replace(/[^\d.-]/g, '')));
             
             // Normalizar data de forma consistente - sempre usar YYYY-MM-DD se possível
             let normalizedDate;
             try {
               const date = new Date(t.created_at);
               if (isNaN(date.getTime())) {
                 // Se a data é inválida, tentar extrair da string
                 const dateStr = t.created_at.toString();
                 const dateMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
                 if (dateMatch) {
                   normalizedDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
                 } else {
                   // Se não conseguir extrair, usar data atual como fallback
                   normalizedDate = new Date().toISOString().split('T')[0];
                 }
               } else {
                 normalizedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
               }
             } catch (e) {
               normalizedDate = new Date().toISOString().split('T')[0];
             }
             
             const key = `${t.description}_${normalizedDate}_${normalizedValue}`;
             
             if (t.category && t.category !== 'Não classificado') {
               existingTransactionsMap.set(key, t.category);

             }
           });

            // SEGUNDO: Remover transações antigas desta conta
          await Transaction.destroy({
            where: {
              id_bank: id_bank,
              [Sequelize.Op.or]: [
                { origin_cpf: cpf },
                { destination_cpf: cpf }
              ]
            }
          });
          
          // TERCEIRO: Inserir novas transações preservando categorias
           const transactionsToCreate = externalData.transactions.map(transaction => {
             // Normalizar valores da mesma forma (consistente com syncAccount)
             const normalizedValue = Math.abs(parseFloat(transaction.value.toString().replace(/[^\d.-]/g, '')));
             
             // Normalizar data de forma consistente - sempre usar YYYY-MM-DD se possível
             let normalizedDate;
             try {
               const date = new Date(transaction.date);
               if (isNaN(date.getTime())) {
                 // Se a data é inválida, tentar extrair da string
                 const dateStr = transaction.date.toString();
                 const dateMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
                 if (dateMatch) {
                   normalizedDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
                 } else {
                   // Se não conseguir extrair, usar data atual como fallback
                   normalizedDate = new Date().toISOString().split('T')[0];
                 }
               } else {
                 normalizedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
               }
             } catch (e) {
               normalizedDate = new Date().toISOString().split('T')[0];
             }
             
             const transactionKey = `${transaction.description}_${normalizedDate}_${normalizedValue}`;
             
             const existingCategory = existingTransactionsMap.get(transactionKey);
             


            // Usar a mesma lógica de mapeamento da função syncTransactions
            const isCredit = transaction.type === 'credit' || 
                            transaction.tipo === 'credito' || 
                            transaction.type === 'entrada' ||
                            transaction.tipo === 'entrada'; // API Caputi, Lucas e Raul - ENTRADA = CRÉDITO
            
            const isDebit = transaction.type === 'saida' || 
                           transaction.tipo === 'saida' ||
                           transaction.type === 'debit' ||
                           transaction.tipo === 'debito';
            
            // Lógica unificada: se é crédito, então 'C', senão 'D'
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
        
        // Retornar sucesso com saldo atualizado
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

  // Lista todas as instituições disponíveis
  static async listAvailableInstitutions(req, res) {
    try {
      const institutions = [];
      
      // Definir todas as APIs disponíveis (nomes serão obtidos dinamicamente das APIs)
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
      
      // Verificar quais APIs estão disponíveis
      for (const api of apis) {
        try {
          // Tentar fazer uma requisição simples para verificar se a API está online
          await axios.get(`${api.url}/health`, { timeout: 2000 });
          institutions.push({
            id: api.name.toLowerCase().replace(/\s+/g, '-'),
            name: api.name,
            status: 'available',
            linkEndpoint: api.linkEndpoint
          });
        } catch (apiError) {
          // Se a API não responder, ainda incluir na lista mas marcar como indisponível
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

  // Busca todas as transações do usuário logado
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

      // Verificar se a transação existe e pertence ao usuário
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

      // Atualizar a categoria
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

  // Métodos para gerenciamento de orçamento mensal
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

      // Verificar se já existe um orçamento para esta categoria no mês/ano atual
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
        // Atualizar orçamento existente
        await existingBudget.update({ limit_amount: limit });
        budget = existingBudget;
      } else {
        // Criar novo orçamento
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