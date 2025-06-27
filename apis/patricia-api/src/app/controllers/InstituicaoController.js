import Instituicao from './models/Instituicao.js';

class InstituicaoController {
  async store(req, res) {
    try {
      const { nome } = req.body;

      const instituicaoExists = await Instituicao.findOne({
        where: { nome }
      });

      if (instituicaoExists) {
        return res.status(400).json({ error: 'Instituição já existe' });
      }

      const novaInstituicao = await Instituicao.create({ nome });
      return res.status(201).json({
        message: 'Instituição criada com sucesso!',
        instituicao: novaInstituicao
      });

    } catch (error) {
      console.error('Erro ao criar instituição:', error);
      return res.status(500).json({ error: 'Erro interno ao criar instituição' });
    }
  }

  async index(req, res) {
    try {
      const instituicoes = await Instituicao.findAll();
      return res.status(200).json(instituicoes);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar instituições' });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;
      const instituicao = await Instituicao.findByPk(id);

      if (!instituicao) {
        return res.status(404).json({ error: 'Instituição não encontrada' });
      }

      return res.status(200).json(instituicao);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar instituição' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const instituicao = await Instituicao.findByPk(id);

      if (!instituicao) {
        return res.status(404).json({ error: 'Instituição não encontrada' });
      }

      await instituicao.destroy();
      return res.status(204).send();

    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar instituição' });
    }
  }
}

export default new InstituicaoController();
