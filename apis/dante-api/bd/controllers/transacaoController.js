const { Transacao, Conta, Usuario } = require('../models');

exports.criarTransacao = async (req, res) => {
  try {
    const { id: usuarioId } = req.params;
    const { contaId, tipo, valor, descricao, data, instituicaoId } = req.body;

    const conta = await Conta.findOne({ where: { id: contaId, usuarioId } });

    if (!conta) return res.status(404).json({ erro: 'Conta não encontrada' });

    const busca_usuario = await Usuario.findByPk(usuarioId);
    const cpf = busca_usuario ? busca_usuario.cpf : null;

    const novaTransacao = await Transacao.create({
      contaId,
      instituicaoId,
      tipo,
      valor,
      descricao, 
      data: data || new Date(),
      usuarioCpf: cpf
    });

    // Atualiza saldo
    let saldoAtual = parseFloat(conta.saldo) || 0;
    let valorNum = parseFloat(valor);

    if(isNaN(valorNum)){
      return res.status(400).json({ erro: 'Valor inválido' });
    }

    conta.saldo = tipo === 'credito' ? saldoAtual + valorNum : saldoAtual - valorNum;
    
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