const { Router } = require('express');
const path = require('path');

const authMiddleware = require('../app/middlewares/authMiddleware');
const userController = require('../app/controllers/userController');
const sessionController = require('../app/controllers/sessionController');
const categoryController = require('../app/controllers/categoryController');
const accountController = require('../app/controllers/accountController');
const openFinanceController = require('../app/controllers/openFinanceController');
const dashboardController = require('../app/controllers/dashboardController');
const routes = new Router();

// Rotas públicas
routes.post('/users', userController.store);
routes.post('/sessions', sessionController.store);

// Rotas autenticadas
routes.use(authMiddleware);

routes.get('/users', userController.show);
routes.put('/users', userController.update);
routes.delete('/users', userController.delete);
routes.post('/category', categoryController.createCategory);

// Rotas Open Finance
routes.get('/open-finance/check-accounts', openFinanceController.checkLinkedAccounts);
routes.get('/open-finance/connected-accounts', openFinanceController.getConnectedAccounts);
routes.post('/open-finance/link-vitor', openFinanceController.linkVitorAccount);
routes.post('/open-finance/link-lucas', openFinanceController.linkLucasAccount);
routes.post('/open-finance/link-patricia', openFinanceController.linkPatriciaAccount);
routes.post('/open-finance/link-dante', openFinanceController.linkDanteAccount);
routes.post('/open-finance/link-raul', openFinanceController.linkRaulAccount);
routes.post('/open-finance/link-caputi', openFinanceController.linkCaputiAccount);
routes.post('/open-finance/sync/:id_bank', openFinanceController.syncAccount);
routes.delete('/open-finance/disconnect/:id_bank', openFinanceController.disconnectAccount);
routes.delete('/open-finance/disconnect-all', openFinanceController.disconnectAllAccounts);
routes.get('/open-finance/institutions', openFinanceController.listAvailableInstitutions);

// Rota para buscar transações do usuário
routes.get('/transactions', openFinanceController.getUserTransactions);

// Rota para atualizar categoria de transação
routes.patch('/transactions/:id/category', openFinanceController.updateTransactionCategory);

// Rotas de orçamento mensal
routes.get('/budgets', openFinanceController.getBudgets);
routes.post('/budgets', openFinanceController.saveBudget);
routes.delete('/budgets/:id', openFinanceController.deleteBudget);

// Rotas da Dashboard
routes.get('/dashboard/overview', dashboardController.getOverviewData);
routes.get('/dashboard/categories', dashboardController.getCategoryExpenses);
routes.get('/dashboard/budget', dashboardController.getBudgetData);
routes.get('/dashboard/transactions', dashboardController.getRecentTransactions);
routes.get('/dashboard/insights', dashboardController.getInsights);

// Rotas antigas (manter compatibilidade)
routes.post('/open-finance/:id_bank', accountController.createAccount);
routes.patch('/open-finance/:id_bank/update', accountController.updateAccount);

module.exports = routes;
