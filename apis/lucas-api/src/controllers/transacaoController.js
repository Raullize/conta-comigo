const { where } = require('sequelize');
const { Transacao, Conta, Usuario, Instituicao } = require('../../models');
const conta = require('../../models/conta');

module.exports = {
    async criaTransacao(req, res) {
        try {
            const { cpf } = req.params;
            const { tipo, valor, contaId } = req.body;
            const usuario = await Usuario.findByPk(cpf);


            if (!usuario) {
                return res.status(404).json({ erro: 'Usuário não encontrado' });
            }

            const conta = await Conta.findOne({
                where: { id: contaId, usuarioCpf: cpf }
            });

            if (!conta) {
                return res.status(404).json({ erro: 'Conta não encontrada' });
            }

            if (tipo !== 'entrada' && tipo !== 'saida') {
                return res.status(404).json({ erro: 'Tipo de transação não aceito' })
            }

            if (tipo === 'entrada') {
                conta.saldo += parseFloat(valor);
            } else {
                if (conta.saldo < valor) {
                    return res.status(400).json({ erro: 'Saldo insuficiente' });
                }
                conta.saldo -= parseFloat(valor);
            }

            await conta.save();

            const novaTransacao = await Transacao.create({
                tipo,
                valor,
                contaId
            });

            return res.status(201).json(novaTransacao);

        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao criar transação', detalhe: error.message })
        }
    },

    async saldoPorInstituicao(req, res) {
        try {
            const { cpf } = req.params;
            const { instituicao } = req.query;
            const usuario = await Usuario.findByPk(cpf, {
                include: [{
                    model: Conta,
                    as: 'contas',
                    include: [{
                        model: Instituicao,
                        as: 'instituicao'
                    }]
                }]
            });

            if (!usuario) {
                return res.status(404).json({ erro: 'Usuário não encontrado' });
            }

            let filtroContas = usuario.contas || [];

            if (instituicao) {
                filtroContas = filtroContas.filter(conta =>
                    conta.instituicao && conta.instituicao.nome.toLowerCase() === instituicao.toLowerCase()
                );
            } 
            
            const resultado = filtroContas.map(conta => ({
                nomeInstituicao: conta.instituicao?.nome,
                saldo: parseFloat(conta.saldo)
            }));

            const saldoTotal = filtroContas.reduce((total, conta) => {
                return total + parseFloat(conta.saldo);
            }, 0);

            return res.status(200).json({ saldoTotal,
                usuario: usuario.nome,
                cpf: usuario.cpf,
                instituicao: resultado
             });
            

        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao buscar saldo por instituição', detalhe: error.message });
        };
    }
};