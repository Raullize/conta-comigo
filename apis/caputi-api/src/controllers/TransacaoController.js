import { Conta, Transacao } from '../models/associations.js';
import { Op } from 'sequelize';

class TransacaoController {
  async create(req, res) {
    const { id: usuario_id } = req.params;
    const { conta_id, tipo, valor, descricao } = req.body;

    try {
      const conta = await Conta.findOne({ where: { id_conta: conta_id, usuario_id } });

      if (!conta) {
        return res.status(404).json({ error: 'Conta não encontrada para este usuário.' });
      }

      if (!['entrada', 'saida'].includes(tipo)) {
        return res.status(400).json({ error: 'Tipo de transação inválido. Use "entrada" ou "saida".' });
      }

      if (valor <= 0) {
        return res.status(400).json({ error: 'Valor deve ser positivo.' });
      }

      if (tipo === 'saida' && parseFloat(conta.saldo) < valor) {
        return res.status(400).json({ error: 'Saldo insuficiente.' });
      }

      const novaTransacao = await Transacao.create({
        conta_id,
        tipo,
        valor,
        descricao
      });

      // Atualizar saldo da conta
      if (tipo === 'entrada') {
        conta.saldo = parseFloat(conta.saldo) + parseFloat(valor);
      } else if (tipo === 'saida') {
        conta.saldo = parseFloat(conta.saldo) - parseFloat(valor);
      }
      
      await conta.save();

      return res.status(201).json(novaTransacao);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar transação.', details: error.message });
    }
  }

  async index(req, res) {
    try {
      const { id } = req.params;
      const { instituicao_id } = req.query;

      // Se ID for 0 ou não fornecido, retorna todas as transações
      if (!id || id === '0') {
        const transacoes = await Transacao.findAll({
          include: [
            {
              model: Conta,
              as: 'conta',
              attributes: ['id_conta', 'nome_usuario', 'cpf_usuario']
            }
          ]
        });

        const resultado = transacoes.map(transacao => ({
          id: transacao.id,
          tipo: transacao.tipo,
          valor: transacao.valor,
          descricao: transacao.descricao,
          data: transacao.createdAt,
          conta: transacao.conta ? {
            id: transacao.conta.id_conta,
            nome: transacao.conta.nome_usuario,
            cpf: transacao.conta.cpf_usuario
          } : null
        }));

        return res.json(resultado);
      }

      // Buscar transações de um usuário específico
      const whereConta = { usuario_id: id };
      if (instituicao_id) {
        whereConta.instituicao_id = instituicao_id;
      }

      const contasUsuario = await Conta.findAll({
        where: whereConta,
        attributes: ['id_conta']
      });

      const idsDasContas = contasUsuario.map(conta => conta.id_conta);

      if (idsDasContas.length === 0) {
        return res.status(404).json({ error: 'Nenhuma conta encontrada para este usuário.' });
      }

      const transacoes = await Transacao.findAll({
        where: {
          conta_id: idsDasContas
        },
        include: [
          {
            model: Conta,
            as: 'conta',
            attributes: ['id_conta', 'nome_usuario', 'cpf_usuario']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      const resultado = transacoes.map(transacao => ({
        id: transacao.id,
        tipo: transacao.tipo,
        valor: transacao.valor,
        descricao: transacao.descricao,
        data: transacao.createdAt,
        conta: transacao.conta ? {
          id: transacao.conta.id_conta,
          nome: transacao.conta.nome_usuario,
          cpf: transacao.conta.cpf_usuario
        } : null
      }));

      return res.json(resultado);
    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao listar transações',
        details: error.message
      });
    }
  }

async indexOF(req, res) {
  try {
    const { id: usuarioId } = req.params;
    let transacoes;
    
    if (!usuarioId || usuarioId === '0') {
      transacoes = await Transacao.findAll({
        include: [
          { model: Conta, as: 'conta', attributes: ['cpf_usuario'] }
        ],
        order: [['createdAt', 'DESC']]
      });
    } else {
      const contasDoUsuario = await Conta.findAll({
        where: { usuario_id: usuarioId },
        attributes: ['id_conta'],
      });
      
      if (!contasDoUsuario || contasDoUsuario.length === 0) {
        return res.json({ transactions: [] });
      }
      
      const idsDasContasDoUsuario = contasDoUsuario.map(conta => conta.id_conta);

      transacoes = await Transacao.findAll({
        where: {
          conta_id: idsDasContasDoUsuario
        },
        include: [
          { model: Conta, as: 'conta', attributes: ['cpf_usuario'] }
        ],
        order: [['createdAt', 'DESC']]
      });
    }

    const resultadoFinal = transacoes.map(t => {
      return {
        id_banco: 6, 
        cpf: t.conta ? t.conta.cpf_usuario : null,
        tipo: t.tipo, // 'entrada' ou 'saida'
        data: t.createdAt,
        descricao: t.descricao,
        valor: t.valor,
      };
    });

    return res.json({ transactions: resultadoFinal });

  } catch (error) {
    console.error('Erro ao listar transações:', error);
    return res.status(500).json({
      error: 'Erro ao listar transações',
      details: error.message,
    });
  }
}
}

export default new TransacaoController();
