import Conta from "./models/Conta.js";
import Transacao from "./models/Transacao.js";
import Instituicao from "./models/Instituicao.js";
import { Op } from 'sequelize';

class ServicoController {
  static async acessoSaldoTotal(usuarioId){
    const contas = await Conta.findAll({ where: { usuario_id: usuarioId},
      include: [{ model: Instituicao, as: 'instituicao', attributes: ['nome']}],
    });

    const saldoTotal = contas.reduce((total, conta)=> {
      return total + parseFloat(conta.saldo);
    }, 0);
    const instituicoes = [ ... new Set(contas.map(c => c.instituicao?.nome).filter(Boolean))
    ];
    return { saldo: saldoTotal, instituicoes};

  }
  static async acessoSaldoInstituicao(usuarioId, instituicaoNome){
    const inst = await Instituicao.findOne({where: { nome: instituicaoNome}});

    if (!inst){
      throw new Error('Essa instituição não foi encontrada ou não existe.');
    }

  const contas = await Conta.findAll({ where: { usuario_id: usuarioId, instituicao_id: inst.id} });

    if (contas.length ===0){
      throw new Error('O usuário não possui conta nessa instituição.')
    }

  const saldo = contas.reduce((total, conta)=> {
    return total + parseFloat(conta.saldo);
  },0 );

  return{ saldo, instituicao: instituicaoNome};
  }

  static async acessoExtratoTotal(usuarioId){
    const contas = await Conta.findAll({ where: { usuario_id: usuarioId} });
    const contaIds = contas.map((conta) => conta.id);

    return Transacao.findAndCountAll({
      where: {
        [Op.or]: [
          { conta_id: { [Op.in]: contaIds }},
          { destinatario_id:{ [Op.in]: contaIds}}
        ],
      },
      order: [['data','DESC']],
    });
  }

  static async acessoExtratoInstituicao(usuarioId, instituicaoNome){
    const inst = await Instituicao.findOne({ where: { nome: instituicaoNome } });
    if (!inst){
      throw new Error('Essa instituição não foi encontrada ou não existe');
    }
    const contas = await Conta.findAll({ where: { usuario_id: usuarioId, instituicao_id: inst.id } });
    const contaIds = contas.map((conta) => conta.id);
    console.log('Contas encontradas:', contaIds);

   if (contas.length ===0){
      throw new Error('O usuário não possui conta nessa instituição.')
    }

   const transacoes = Transacao.findAll({
      where: {
        [Op.or]: [
          { conta_id: { [Op.in]: contaIds} },
          { destinatario_id: { [Op.in]: contaIds } },
        ],
      },
      order: [['data','DESC']],
    });

    console.log('Extrato das transações:', (await transacoes).length);
    return transacoes;
  }
}

export default ServicoController;
