import {Instituicao as Institution} from '../models/associations.js';


class InstitutionController {
  async create(req, res) {
    try {
      const { nome, cnpj } = req.body;

      const InstitutionIsValid = await Institution.findOne({ where: { nome } });
      if (InstitutionIsValid) {
        return res.status(400).json({ error: 'Já existe uma instituição com este nome.' });
      }

      const instituicaoExistenteCNPJ = await Institution.findOne({ where: { cnpj } });
      if (instituicaoExistenteCNPJ) {
        return res.status(400).json({ error: 'Já existe uma instituição com este CNPJ.' });
      }

      const instituicao = await Institution.create({ nome, cnpj });

      return res.status(201).json(instituicao);
    } catch (error) {
      return res.status(400).json({ error: 'Erro ao criar instituição', details: error.message });
    }
  }

  async index(req, res) {
    try {
      const { id } = req.params; 
  
      if (id) {
        
        const instituicao = await Institution.findOne({
          where: { id },
          attributes: ['id', 'nome']
        });
  
        if (!instituicao) {
          return res.status(404).json({ error: 'Instituição não encontrada.' });
        }
  
        return res.status(200).json(instituicao);
      } else {
        
        const instituicoes = await Institution.findAll({
          attributes: ['id', 'nome']
        });
  
        return res.status(200).json(instituicoes); 
      }
    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao listar instituições',
        details: error.message
      });
    }
  }
}

export default new InstitutionController();
