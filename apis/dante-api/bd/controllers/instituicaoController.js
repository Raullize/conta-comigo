const { Instituicao } = require('../models');

exports.criarInstituicao = async (req, res) => {
  try {
    const { nome } = req.body;
    const instituicao = await Instituicao.create({ nome });
    res.status(201).json(instituicao);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
};

exports.atualizarInstituicao = async (req, res)=> {
  const { id } = req.params;
  const { nome } = req.body;

  try {
    const instituicao = await Instituicao.findByPk(id);
    if (!instituicao) return res.status(404).json({ erro: "Instituição não encontrada" });

    await instituicao.update({ nome });
    res.json(instituicao);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao atualizar a instituição" });
  }
}


exports.deletarInstituicao = async (req, res) => {
  try {
    const { id } = req.params;
    const instituicao = await Instituicao.findByPk(id);

    if (!instituicao) return res.status(404).json({ erro: 'Instituição não encontrada.' });

    await instituicao.destroy();
    res.status(204).json({ mensagem: 'Instituição deletada com sucesso.' });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
};
