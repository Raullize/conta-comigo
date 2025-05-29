import { Router } from 'express';

import authMiddleware from './app/middleware/auth.js';

import UserController from './app/controllers/UserController'
import SessionController from './app/controllers/SessionController';
import InstituicaoController from './app/controllers/InstituicaoController.js';
import ContaController from './app/controllers/ContaController.js';
import TransacaoController from './app/controllers/TransacaoController.js';

const routes = new Router();

//rotas da instituição
routes.post('/instituicao', InstituicaoController.store);

routes.delete('/instituicao', InstituicaoController.delete);

//rotas do usuário
routes.post('/users',UserController.store);

routes.post('/sessions',SessionController.store);

//precisa autenticar.

routes.use(authMiddleware);

routes.put('/users',UserController.update);

//rotas da conta

routes.post('/conta', ContaController.store);

routes.post('/contas', ContaController.index);

//rotas da transacao.

routes.post('/transacao', TransacaoController.store);

//rotas de serviço.

routes.get('/saldo/instituicao/:nome', ContaController.saldoInstituicao);

routes.get('/saldo/total', ContaController.saldoTotal);

routes.get('/extrato/total', ContaController.extratoTotal);

routes.get('/extrato/instituicao/:nome', ContaController.extratoInstituicao);

export default routes;

