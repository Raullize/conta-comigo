import { Conta, Transacao } from '../models/associations.js';
import { Op } from 'sequelize';

class TransacaoController {
  async create(req, res) {
    const { id: usuario_id } = req.params;
    const { conta_id, tipo, valor, descricao, conta_destino_id } = req.body;

    try {
      const conta = await Conta.findOne({ where: { id_conta: conta_id, usuario_id } });

      if (!conta) {
        return res.status(404).json({ error: 'Conta de origem não encontrada para este usuário.' });
      }

      if (!['deposito', 'saque', 'transferencia'].includes(tipo)) {
        return res.status(400).json({ error: 'Tipo de transação inválido.' });
      }

      if (tipo === 'transferencia' && conta_id === conta_destino_id) {
        return res.status(400).json({ error: 'A conta de origem e destino devem ser diferentes.' });
      }

      if (valor <= 0) {
        return res.status(400).json({ error: 'Valor inválido.' });
      }

      if ((tipo === 'saque' || tipo === 'transferencia') && parseFloat(conta.saldo) < valor) {
        return res.status(400).json({ error: 'Saldo insuficiente.' });
      }

      let contaDestino = null;
      if (tipo === 'transferencia') {
        contaDestino = await Conta.findByPk(conta_destino_id);
        if (!contaDestino) {
          return res.status(404).json({ error: 'Conta de destino não encontrada.' });
        }
      }

      const novaTransacao = await Transacao.create({
        conta_id,
        tipo,
        valor,
        descricao,
        conta_destino_id: tipo === 'transferencia' ? conta_destino_id : null
      });

      if (tipo === 'deposito') {
        conta.saldo = parseFloat(conta.saldo) + parseFloat(valor);
        await conta.save();
      }

      if (tipo === 'saque') {
        conta.saldo = parseFloat(conta.saldo) - parseFloat(valor);
        await conta.save();
      }

      if (tipo === 'transferencia') {
        conta.saldo = parseFloat(conta.saldo) - parseFloat(valor);
        contaDestino.saldo = parseFloat(contaDestino.saldo) + parseFloat(valor);
        await conta.save();
        await contaDestino.save();
      }

      return res.status(201).json(novaTransacao);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar transação.', details: error.message });
    }
  }

  async index(req, res) {
    try {
      const { id } = req.params;
      const { instituicao_id } = req.query;

      // Se o id for 0 ou nulo, retorna todas as transações
      if (!id || id === '0') {
        const transacoes = await Transacao.findAll({
          include: [
            {
              model: Conta,
              as: 'conta',
              attributes: ['id_conta', 'nome_usuario', 'cpf_usuario']
            },
            {
              model: Conta,
              as: 'conta_destino',
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
          de: transacao.conta ? {
            id: transacao.conta.id_conta,
            nome: transacao.conta.nome_usuario,
            cpf: transacao.conta.cpf_usuario
          } : null,
          para: transacao.conta_destino ? {
            id: transacao.conta_destino.id_conta,
            nome: transacao.conta_destino.nome_usuario,
            cpf: transacao.conta_destino.cpf_usuario
          } : null
        }));

        return res.json(resultado);
      }

      // Caso contrário, filtra pelas contas do usuário
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
        return res.status(404).json({ error: 'Nenhuma conta encontrada para este usuário e instituição.' });
      }

      const transacoes = await Transacao.findAll({
        where: {
          [Op.or]: [
            { conta_id: idsDasContas },
            { conta_destino_id: idsDasContas }
          ]
        },
        include: [
          {
            model: Conta,
            as: 'conta',
            attributes: ['id_conta', 'nome_usuario', 'cpf_usuario']
          },
          {
            model: Conta,
            as: 'conta_destino',
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
        de: transacao.conta ? {
          id: transacao.conta.id_conta,
          nome: transacao.conta.nome_usuario,
          cpf: transacao.conta.cpf_usuario
        } : null,
        para: transacao.conta_destino ? {
          id: transacao.conta_destino.id_conta,
          nome: transacao.conta_destino.nome_usuario,
          cpf: transacao.conta_destino.cpf_usuario
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
}

export default new TransacaoController();
