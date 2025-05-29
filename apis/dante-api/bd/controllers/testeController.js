const { Usuario } = require('../models');

exports.cadastrarUsuarioTeste = async (req, res) => {
  try {
    const novoUsuario = await Usuario.create({
      nome: 'Usuário Teste',
      email: 'teste@teste.com'
    });

    res.status(201).json({
      mensagem: 'Usuário criado com sucesso!',
      usuario: novoUsuario
    });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao criar usuário: ' + erro.message });
  }
};
