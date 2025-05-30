import { Router } from 'express';

import authMiddleware from './app/middlewares/auth';

import BalanceController from './app/controllers/BalanceController';
import BankAccountController from './app/controllers/BankAccountController';
import SessionController from './app/controllers/SessionController';
import TransactionController from './app/controllers/TransactionController';
import UserController from './app/controllers/UserController';

const routes = new Router();

// Rotas públicas
routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

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
