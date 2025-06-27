import { Router } from 'express';

import UserController from './app/controllers/UserController.js';
import InstituicaoController from './app/controllers/InstituicaoController.js';
import ContaController from './app/controllers/ContaController.js';
import TransacaoController from './app/controllers/TransacaoController.js';
import { getDataAccount, updateConsent } from './app/controllers/openFinanceController.js';

const routes = new Router();

// Health check
routes.get('/', (req, res) => {
  res.json({ message: 'Patricia API is running!' });
});

// Rotas de usuários
routes.post('/users', UserController.store);
routes.get('/users', UserController.index);
routes.get('/users/:cpf', UserController.show);
routes.put('/users/:cpf', UserController.update);
routes.delete('/users/:cpf', UserController.delete);

// Rotas de instituições
routes.post('/institutions', InstituicaoController.store);
routes.get('/institutions', InstituicaoController.index);
routes.get('/institutions/:id', InstituicaoController.show);
routes.delete('/institutions/:id', InstituicaoController.delete);

// Rotas de contas (padrão Raul)
routes.post('/users/:cpf/accounts', ContaController.store);
routes.get('/users/:cpf/accounts', ContaController.index);
routes.get('/accounts', ContaController.index);

// Rotas de transações (padrão Raul)
routes.post('/users/:cpf/transactions', TransacaoController.store);
routes.get('/users/:cpf/transactions', TransacaoController.index);

// Rotas de serviços
routes.get('/users/:cpf/balance', ContaController.saldoTotal);
routes.get('/users/:cpf/statement', ContaController.extratoTotal);

// Rotas open finance
routes.get('/open-finance/:cpf', getDataAccount);
routes.patch('/open-finance/:cpf/consent', updateConsent);

export default routes;

