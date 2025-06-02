import { Router } from 'express';
import UserController from './controllers/UserController.js';
import InstitutionController from './controllers/InstituitionController.js';
import ContaController from './controllers/ContaController.js';
import TransacaoController from './controllers/TransacaoController.js';

const routes = Router();
routes.get('/', (req,res)=>{
    res.send({message: 'olá mundo'});
});

routes.get('/usuarios', UserController.index);

routes.post('/usuarios', UserController.create);

routes.get('/usuarios/:id/saldo', UserController.obterSaldo);

routes.post('/instituicoes',InstitutionController.create);
routes.get('/instituicoes',InstitutionController.index);
routes.get('/instituicoes/:id/',InstitutionController.index)

routes.get('/usuarios/extrato',TransacaoController.index);
routes.get('/usuarios/:id/extrato',TransacaoController.index);

routes.post('/usuarios/:id/transacoes',TransacaoController.create);

routes.post('/usuarios/contas',ContaController.create);
routes.get('/usuarios/contas',ContaController.index);
routes.get('/usuarios/:id/contas',ContaController.listarPorUsuario)

routes.get('/usuarios/:id/', UserController.index);

export default routes;
