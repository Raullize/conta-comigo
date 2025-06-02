const { Conta, Instituicao } = require('../models');
const { Transacao, Usuario } = require('../models');

exports.getSaldoTotal = async (req, res) => {
  try {
    const { id } = req.params;
    const { instituicao } = req.query;

    const filtro = { where: { usuarioId: id } };

    if (instituicao) {
      filtro.include = [{
        model: Instituicao,
        where: { nome: instituicao }
      }];
    }

    const contas = await Conta.findAll(filtro);

    const saldoTotal = contas.reduce((soma, conta) => soma + conta.saldo, 0);

    res.json({ saldoTotal });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
};


exports.getExtrato = async (req, res) => {
  try {
    const { id } = req.params;
    const { instituicao } = req.query;

    const where = instituicao
      ? { usuarioId: id, '$Conta.Instituicao.nome$': instituicao }
      : { usuarioId: id };

    const transacoes = await Transacao.findAll({
      include: [{
        model: Conta,
        where: { usuarioId: id },
        include: [{ model: Instituicao }]
      }]
    });

    res.json({ transacoes });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
};


exports.criarUsuario = async (req, res) => {
  try {
    const { nome, email } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ erro: 'Nome e email são obrigatórios.' });
    }

    const novoUsuario = await Usuario.create({ nome, email });
    res.status(201).json(novoUsuario);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
};


exports.atualizarUsuario= async (req, res)=> {
    const { id } = req.params;
    const { nome, email } = req.body;
  
    try {
      const usuario = await Usuario.findByPk(id);
      if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado" });
  
      await usuario.update({ nome, email });
      res.json(usuario);
    } catch (erro) {
      res.status(500).json({ erro: "Erro ao atualizar o usuário" });
    }
  }

  exports.deletarUsuario = async (req, res) => {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findByPk(id);
  
      if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });
  
      await usuario.destroy();
      res.status(204).json({ mensagem: 'Usuário deletado com sucesso.' });
    } catch (erro) {
      res.status(500).json({ erro: erro.message });
    }
  };
  