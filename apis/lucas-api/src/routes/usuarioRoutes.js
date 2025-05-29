const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

router.post('/usuarios', usuarioController.criaUsuario);
router.get('/usuarios', usuarioController.listaUsuario);
router.get('/usuarios/:cpf', usuarioController.listaPorCpf);
router.put('/usuarios/:cpf', usuarioController.editaUsuario);
router.delete('/usuarios/:cpf', usuarioController.deletaUsuario);
router.get('/usuarios/:cpf/extrato', usuarioController.extratoTotal);

module.exports = router;
