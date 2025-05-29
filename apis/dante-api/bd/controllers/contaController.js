const { Conta } = require('../models');

exports.criarConta = async (req, res) => {
  try {
    const { id } = req.params; // ID usuário
    const { instituicaoId, saldo } = req.body;

    const conta = await Conta.create({
      usuarioId: id,
      instituicaoId,
      saldo: saldo || 0,
    });

    res.status(201).json(conta);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
};

exports.atualizarConta = async (req, res)=> {
  const { id } = req.params;
  const { saldo, instituicaoId } = req.body;

  try {
    const conta = await Conta.findByPk(id);
    if (!conta) return res.status(404).json({ erro: "Conta não encontrada" });

    await conta.update({ saldo, instituicaoId });
    res.json(conta);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao atualizar a conta" });
  }
}

exports.deletarConta = async (req, res) => {
  try {
    const { id } = req.params;
    const conta = await Conta.findByPk(id);

    if (!conta) return res.status(404).json({ erro: 'Conta não encontrada.' });

    await conta.destroy();
    res.status(204).json({ mensagem: 'Conta deletada com sucesso.' });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
};