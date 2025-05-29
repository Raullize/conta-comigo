import *as Yup from 'yup';
import Transacao from '../controllers/models/Transacao.js';
import Conta from '../controllers/models/Conta.js';


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
      data,
      conta_id,
      destinatario_id: tipo === 'transferencia' ? destinatario_id: null,
     })

     const formDate = (date) => {return date.toISOString().split('T')[0];
    };

     return res.json({
      message: 'Operação realizada com sucesso.',
      transacao: {
        descricao: transacao.descricao,
        tipo: transacao.tipo,
        valor: Number(transacao.valor),
        data: formDate(transacao.data),
        conta_id: transacao.conta_id,
        destinatario_id: transacao.destinatario_id,
      },
    });

    }catch (err) {
      console.error('Erro ao realizar transação', err);
      return res.status(500).json({ error: 'Erro interno ao realizar a transação'});
    }
  }
    }


  export default new TransacaoController();
