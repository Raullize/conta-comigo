import ServicoController from './ServicoController.js'
import Conta from '../controllers/models/Conta';
import *as Yup from 'yup';
import Instituicao from './models/Instituicao';
import User from './models/User.js';


class ContaController{
  async store(req,res){
    const schema = Yup.object().shape({
      numero: Yup.string().required(),
      instituicao_id: Yup.number().integer().required(),


    });

    if(!(await schema.isValid(req.body))){
      return res.status(400).json({error: 'Falha ao cadastrar.'});
    }

    const contaExists = await Conta.findOne({
      where: { numero: req.body.numero}
    });

    if(contaExists){
      return res.status(400).json({error: 'Essa conta já existe.'});
    }

    const instituicao = await Instituicao.findByPk(req.body.instituicao_id);

    if (!instituicao) {
      return res.status(400).json({ error: 'Instituição não encontrada' });
}

    const { numero, instituicao_id } = req.body;
    try {
    const contas = await Conta.create({
      usuario_id: req.userId,
      numero,
      instituicao_id,
      saldo: 0,
    })

    return res.json({
      message: 'Conta criada com sucesso!.',
      contas: {
        numero,
        saldo: 0,
        usuario_id: req.userId,
        instituicao_id,
      }
    });

  }catch (err) {
    console.error('Erro ao criar conta:', err);
    return res.status(500).json({ error: 'Erro interno ao criar conta.' });
  }
}

  async index(req,res){
    const user = await User.findByPk(req.userId);

    if ('usuario_id' in req.body && Number(req.body.usuario_id) !== req.userId) {
      return res.status(403).json({
        error: 'Você não tem permissão para acessar esses dados.'
      });
    }

    if (!user){
      return res.status(404).json({error: 'Usuário não foi encontrado'});
   }

    const contas = await Conta.findAndCountAll({
      where: { usuario_id: req.userId},
      include: [{ model: Instituicao, as: 'instituicao', attributes: ['id','nome']}]
    });

    if(!contas || contas.length === 0){
      return res.status (404).json({ error: 'Nenhuma conta foi encontrada para esse usuário.'})
    }

    return res.json(contas);
  }

  async saldoTotal(req,res){
    try{
      const {saldo, instituicoes} = await ServicoController.acessoSaldoTotal(req.userId);

      return res.json({ saldo, instituicoes,});
    } catch (err) {
      console.error('Erro, não foi possível obter o saldo total:', err);
      return res.status(500).json({ error: 'Erro, não foi possível obter o saldo total.'});
    }
  }
  async saldoInstituicao(req,res){
    const { nome } = req.params;
    try{
      const {saldo, instituicao} = await ServicoController.acessoSaldoInstituicao(req.userId, nome);
      return res.json({ saldo, instituicao});
    } catch (err){
      console.error('Erro, não foi possível obter o saldo.',err.message);
      return res.status(400).json({ error: err.message });
    }
  }
  async extratoTotal(req,res){
    try {
      const transacoes = await ServicoController.acessoExtratoTotal(req.userId);
      return res.json(transacoes);
    }catch (err){
      console.error('Erro, não foi possível obter o extrato.', err);
      return res.status(500).json({ error: 'Erro, não foi possível obter o extrato.'});
    }
  }
  async extratoInstituicao (req,res){
  const { nome } = req.params;
   try{
      const transacoes = await ServicoController.acessoExtratoInstituicao(req.userId, nome);
      return res.json(transacoes);
    }catch (err){
      console.error('Erro, não foi possível obter o extrato.', err.message);
      return res.status(400).json({ error: err.message });
    }
  }
 }

export default new ContaController();
