const { Instituicao } = require('../../models');

module.exports = {
    async criarInstituicao(req, res) {
        const existingInstitution = await Instituicao.findOne();

    if (existingInstitution) {
        return res.status(400).json({ error: 'Permitido apenas o cadastro de uma instituição.' });
    };
        try {
            const { nome } = req.body;
            const jaExiste = await Instituicao.findOne({ where: {nome}});

            if(!nome) {
                return res.status(400).json({erro: 'Nome da instituição é obrigatório.'});
            }

            if(jaExiste) {
                return res.status(409).json({erro: 'Intituição já cadastrada.'});
            }

            const novaInstituicao = await Instituicao.create({nome});

            return res.status(201).json(novaInstituicao);

        } catch(err){
            return res.status(500).json({erro: 'Erro interno do servidor'});
        }
    },
    
    async listaInstituicao(req, res){
        try {
            const contas = await Instituicao.findAll();
            return res.status(200).json(contas);

        } catch (error) {
            return res.status(400).json({erro: 'Erro ao buscar instituições'})
        }
    }
}