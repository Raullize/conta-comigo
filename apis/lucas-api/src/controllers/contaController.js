const { Conta, Usuario, Instituicao } = require('../../models');

module.exports = {
    async criaConta(req, res){
        try {
            const { cpf } = req.params
            const { saldo, instituicaoId } = req.body;
            const usuario = await Usuario.findByPk(cpf);
            const instituicao = await Instituicao.findByPk(instituicaoId);

            if(!usuario || !instituicao){
                return res.status(404).json({erro: 'Usuário e/ou instituição inexistentes'});
            }

            const novaConta = await Conta.create({ 
                saldo, 
                usuarioCpf: cpf, 
                instituicaoId });

            return res.status(201).json(novaConta);

        } catch (error) {
            return res.status(500).json({erro: 'Erro ao criar conta.', detalhe: error.message });
        }
    },

    async listaConta(req, res){
        try {
            const contas = await Conta.findAll({
                inlcude: [Usuario, Instituicao]
            });
            return res.status(200).json(contas);
        } catch (error) {
            return res.status(500).json({erro: 'Erro ao listar contas.'})
        }
    },

    async buscaContaPorId(req, res){
        try {
            const { id } = req.params;
            const conta = await Conta.findByPk(id, {
                include: [
                    {
                        model: Usuario,
                        as: 'usuario'
                    },
                    {
                        model: Instituicao,
                        as: 'instituicao'
                    }
                ]
            });

            if(!conta){
                return res.status(404).json({erro: 'Conta não encontrada'})
            }

            return res.status(200).json(conta);

        } catch (error) {
            return res.status(500).json({erro: 'Erro ao encontrar conta.', detalhe: error.message })
        }
    },

    async deletaConta(req,res){
        try {
            const { id } = req.params
            const conta = await Conta.findByPk(id, {
                include: [{
                    model: Usuario,
                    as: 'usuario'
                },
                {   model: Instituicao,
                    as: 'instituicao'
                }]
            });

            if(!conta){
                return res.status(404).json({erro: 'Erro ao encontrar a conta'});
            }

            await conta.destroy();

            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({erro: 'Erro a deletar a conta', detalhe: error.message});
        }
    }


}