/* eslint-disable */
import *as Yup from 'yup';
import Transacao from '../controllers/models/Transacao.js';
import Conta from '../controllers/models/Conta.js';
import User from '../controllers/models/User.js';


class TransacaoController {
  async store(req,res){
    const schema = Yup.object().shape({
      descricao: Yup.string(),
      tipo: Yup.string().oneOf(['credito','debito','transferencia']).required(),
      valor: Yup.number().positive().required(),
      data: Yup.date(),
      conta_id: Yup.number().integer().required(),
      destinatario_id: Yup.number().integer(),
    });

    if(!(await schema.isValid(req.body))){
      return res.status(400).json({error: 'Falha na validação.'})
    }

    const {descricao, tipo, valor, data, conta_id, destinatario_id} = req.body;

    const conta = await Conta.findByPk(conta_id);
    if(!conta)
      {return res.status(400).json ({error: 'Essa conta não existe.'});
    }

    if (conta.usuario_id !== req.userId) {
      return res.status(403).json({ error: 'Você não tem permissão para operar nesta conta.' });
    }

    let cpfDoUser = "CPF não encontrado";
    if (conta.usuario_id){
      const usuarioDaConta = await Usuario.findByPk(conta.usuario_id);
      if (usuarioDaConta && usuarioDaConta.cpf){
        cpfDoUser = usuarioDaConta.cpf;
      }else {
        console.warn ('Cpf não encontrado para o user id');
      }
    }
    const id_banco = conta.id_banco_placeholder || "Id de banco não configurada"

    if(tipo === 'transferencia'){
      if (!destinatario_id){
        return res.status(400).json({error: 'O ID do destinatário é obrigatório em transferências'});
      }

    if(conta_id === destinatario_id){
      return res.status(400).json({ error: 'Sua conta de origem e seu destinatário não podem ser iguais.' });
    }

    const destinatario = await Conta.findByPk(destinatario_id);

    if(!destinatario){return res.status(400).json({error: 'A conta destinatária não existe ou não foi encontrada.'})};

    if (conta.saldo < valor){
      return res.status(400).json({error: 'Saldo insuficiente.'})
    }

    //operações que o cliente pode realizar.
    //1º transferência
    conta.saldo = Number(conta.saldo) - Number(valor);
    destinatario.saldo = Number(destinatario.saldo) + Number(valor);

    await conta.save();
    await destinatario.save();

    }
    //2º débito
    if (tipo === 'debito'){
      if (Number(conta.saldo) < Number(valor)) {
        return res.status(400).json({error :'Saldo insuficiente.'})
      }

      conta.saldo = Number(conta.saldo) - Number(valor);
      await conta.save();

    }
    //3º crédito
      if (tipo === 'credito'){
        conta.saldo = Number(conta.saldo) + Number(valor);
        await conta.save();
      }


    try {
      const transacao = await Transacao.create({
      descricao,
      tipo,
      valor,
      data: data || new Date(),
      conta_id,
      destinatario_id: tipo === 'transferencia' ? destinatario_id: null,
     });

     let tipoResposta;
     if (transacao.tipo === 'credito'){
      tipoResposta = 'deposito';
     } else if (transacao.tipo === 'debito' || transacao.tipo === 'transferencia'){
      tipoResposta = 'saque';
     }else {
      tipoResposta= transacao.tipo; 
     }

     const formDate = (dateValue) => {
      if (!dateValue) return null;
      try{
        return new Date(dateValue).toISOString().split('T')[0];
      } catch (e){
        console.error("Erro ao formatar data", dataValue, e);
        return String(dateValue); 
      }
     };

     const dataFormatada = formDate(transacao.createdAt);
               
    const responseBody = {
      message: 'Operação realizada com sucesso.',
      transacao: {
       id_banco: id_banco,
       cpf: cpfDoUser,
       tipo: tipoResposta,
       valor: Number(transacao.valor),
       data: dataFormatada,
       descricao: transacao.descricao,
      },
    };

    return res.status(201).json(responseBody);

    }catch (err) {
      console.error('Erro ao realizar transação', err);
      if (err.name === 'SequelizeValidationError'|| err.name === 'SequelizeUniqueConstraintError'){ 
        return res.status(400).json({ error: 'Erro de validação nos dados da transação'});
      }
        return res.status(500).json({ error: 'Erro interno ao realizar a transação'});
    }
  }
    }


  export default new TransacaoController();
