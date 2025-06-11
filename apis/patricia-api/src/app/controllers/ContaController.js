import ServicoController from './ServicoController.js'
import Conta from '../controllers/models/Conta.js';
import *as Yup from 'yup';
import Instituicao from './models/Instituicao.js';
import User from './models/User.js';


class ContaController{
  async store(req,res){
    const schema = Yup.object().shape({
      numero: Yup.string().required(),
      instituicao_id: Yup.number().integer().required(),
      consent: Yup.boolean(),
    });

    if(!(await schema.isValid(req.body))){
      return res.status(400).json({error: 'Falha ao cadastrar.'});
    }

    try {
        const user = await User.findByPk(req.userId);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
   const contaExists = await Conta.findOne({
       where: {
          numero: req.body.numero,
          instituicao_id: req.body.instituicao_id,
          user_cpf: user.cpf 
        }
      });

    if(contaExists){
      return res.status(400).json({error: 'Essa conta já existe.'});
    }

    const instituicao = await Instituicao.findByPk(req.body.instituicao_id);
    if (!instituicao) {
      return res.status(400).json({ error: 'Instituição não encontrada' });
}

    const { numero, instituicao_id, consent } = req.body;
   
    const novaConta = await Conta.create({
      user_cpf: user.cpf,
      numero,
      instituicao_id,
      saldo: 0,
      consent,
    })

    return res.json({
      message: 'Conta criada com sucesso!.',
      conta: novaConta
      
    });

  }catch (err) {
    console.error('Erro ao criar conta:', err);
    return res.status(500).json({ error: 'Erro interno ao criar conta.' });
  }
 }
  async index(req,res){
    try{ 
      const user = await User.findByPk(req.userId);

    if (!user){
      return res.status(404).json({error: 'Usuário não foi encontrado'});
   }  
    const contas = await Conta.findAndCountAll({
      where: { user_cpf: user.cpf},
      include: [{ model: Instituicao, as: 'instituicao', attributes: ['id','nome']}]
    });

     if (contas.count === 0) {
            return res.status(404).json({ message: 'Nenhuma conta foi encontrada para este usuário.' });
     }

    return res.json(contas);
  } catch (err) {
        console.error('Erro ao listar contas:', err);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
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
