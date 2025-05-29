const { Transacao, Conta } = require('../models');

exports.criarTransacao = async (req, res) => {
  try {
    const { id: usuarioId } = req.params;
    const { contaId, tipo, valor, descricao } = req.body;

    const conta = await Conta.findOne({ where: { id: contaId, usuarioId } });
    if (!conta) return res.status(404).json({ erro: 'Conta não encontrada' });

    const novaTransacao = await Transacao.create({
      contaId,
      tipo,
      valor,
      descricao
    });

    // Atualiza saldo
    let valorNum = parseFloat(valor)
    conta.saldo += tipo === 'credito' ? valorNum : -valorNum;
    await conta.save();

    res.status(201).json(novaTransacao);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
};


exports.deletarTransacao = async (req, res) => {
  try {
    const { id } = req.params;
    const transacao = await Transacao.findByPk(id);

    if (!transacao) return res.status(404).json({ erro: 'Transação não encontrada.' });

    await transacao.destroy();
    res.status(204).json({ mensagem: 'Transação deletada com sucesso.' });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
};