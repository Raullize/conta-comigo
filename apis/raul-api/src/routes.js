import { Router } from 'express';

import { getDataAccount } from './app/controllers/openFinanceController.js';
import { updateConsent } from './app/controllers/openFinanceController.js';
import InstitutionController from './app/controllers/InstitutionController.js';
import UserController from './app/controllers/UserController.js';
import AccountController from './app/controllers/AccountController.js';
import SimpleTransactionController from './app/controllers/SimpleTransactionController.js';

const routes = new Router();

// Health check
routes.get('/', (req, res) => {
  res.json({ message: 'Raul API is running!' });
});

routes.get('/health', (req, res) => {
  res.json({ status: 'healthy', message: 'Raul API is running!' });
});

// Open Finance routes
routes.get('/open-finance/:cpf', getDataAccount);
routes.patch('/open-finance/:cpf/consent', updateConsent);

// Institutions routes
routes.post('/institutions', InstitutionController.store);
routes.get('/institutions', InstitutionController.index);

// Users routes
routes.post('/users', UserController.store);
routes.get('/users', UserController.index);
routes.get('/users/:cpf', UserController.show);
routes.get('/users/:cpf/balance', UserController.getTotalBalance);
routes.get('/users/:cpf/statement', UserController.getStatement);

// Accounts routes
routes.post('/users/:cpf/accounts', AccountController.store);
routes.get('/users/:cpf/accounts', AccountController.index);
routes.get('/accounts', AccountController.index);

// Transactions routes
routes.post('/users/:cpf/transactions', SimpleTransactionController.store);
routes.get('/users/:cpf/transactions', SimpleTransactionController.index);

export default routes;
