import { Router } from 'express';

import authMiddleware from './app/middlewares/auth.js';

import { getDataAccount } from './app/controllers/openFinanceController.js';
import { updateConsent } from './app/controllers/openFinanceController.js';
import BalanceController from './app/controllers/BalanceController.js';
import BankAccountController from './app/controllers/BankAccountController.js';
import SessionController from './app/controllers/SessionController.js';
import TransactionController from './app/controllers/TransactionController.js';
import UserController from './app/controllers/UserController.js';

const routes = new Router();

// Rotas públicas
routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

// Open finance
routes.get('/open-finance/:cpf', getDataAccount);
routes.patch('/open-finance/:cpf/consent', updateConsent);

// Todas as rotas abaixo necessitam de autenticação
routes.use(authMiddleware);

// Rotas de usuário
routes.get('/users', UserController.index);
routes.get('/users/:id', UserController.show);
routes.put('/users', UserController.update);

// Rotas de contas bancárias
routes.post('/accounts', BankAccountController.store);
routes.get('/accounts', BankAccountController.index);
routes.get('/accounts/:id', BankAccountController.show);
routes.put('/accounts/:id', BankAccountController.update);
routes.delete('/accounts/:id', BankAccountController.delete);

// Rotas de transações
routes.post('/accounts/:account_id/transactions', TransactionController.store);
routes.get('/accounts/:account_id/transactions', TransactionController.index);
routes.get('/transactions/:id', TransactionController.show);
routes.get('/transactions', TransactionController.getAllTransactions);

// Rotas de balanço financeiro
routes.get('/balance', BalanceController.index);

export default routes;
