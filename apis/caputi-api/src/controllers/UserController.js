import { fn, col } from 'sequelize';
import { User, Conta, Instituicao} from '../models/associations.js';

class UserController {
    async create(req, res) {
        const { cpf, nome } = req.body;

        try {
            const existingCpf = await User.findOne({ where: { cpf } });
            if (existingCpf) {
                return res.status(409).json({ error: 'Já existe um usuário com este CPF.' });
            }

            const user = await User.create({ cpf, nome });
            return res.status(201).json(user);

        } catch (error) {
            return res.status(500).json({ error: 'Erro ao criar usuário', details: error.message });
        }
    }

    async index(req, res) {
        const { id } = req.params;
        try {
            if (id && id > 0) {
                const usuario = await User.findByPk(id, {
                    include: [{
                        model: Conta,
                        as: 'contas',
                        attributes: []
                    }],
                    attributes: {
                        include: [
                            [fn('COUNT', col('contas.id_conta')), 'qtd_contas']
                        ]
                    },
                    group: ['usuarios.id'], 
                });
    
                if (!usuario) {
                    const qtdUsuarios = await User.count();
                    return res.status(404).json({ 
                        error: 'Usuário não encontrado',
                        qtd_usuarios: qtdUsuarios 
                    });
                }
    
                return res.json(usuario);
            }
            const usuarios = await User.findAll({
                include: [{
                    model: Conta,
                    as: 'contas',
                    attributes: []
                }],
                attributes: {
                    include: [
                        [fn('COUNT', col('contas.id_conta')), 'qtd_contas']
                    ]
                },
                group: ['usuarios.id'], 
            });
    
            return res.json(usuarios);
        } catch (error) {
            return res.status(500).json({
                error: 'Erro ao verificar usuário(s)',
                details: error.message
            });
        }
    }

    async obterSaldo(req, res) {
  const { id } = req.params;
  const { instituicao } = req.query;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    const usuario = await User.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const whereConta = { usuario_id: id };
    const include = [];

    if (instituicao) {
      include.push({
        model: Instituicao,
        as: 'instituicao',
        where: { id: instituicao },
        attributes: [] 
      });
    }

    const contas = await Conta.findAll({
      where: whereConta,
      attributes: ['saldo'],
      include
    });

    if (contas.length === 0) {
      return res.status(404).json({
        error: 'Usuário não possui contas ou não há contas nessa instituição'
      });
    }

    const saldoTotal = contas.reduce((acc, conta) => acc + parseFloat(conta.saldo), 0);

    return res.json({ saldo_total: saldoTotal.toFixed(2) });
  } catch (error) {
    return res.status(500).json({
      error: 'Erro ao calcular o saldo',
      details: error.message
    });
  }
}

    
}

export default new UserController();
