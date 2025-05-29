const express = require ('express');
const router = express.Router();
const trasacaoController = require('../controllers/transacaoController');

router.post('/usuarios/:cpf/transacoes', trasacaoController.criaTransacao);
// router.get('/usuarios/:cpf/saldo', trasacaoController.saldoUsuario);
router.get('/usuarios/:cpf/saldo', trasacaoController.saldoPorInstituicao);

module.exports = router;