import * as Yup from 'yup';
import Instituicao from './models/Instituicao.js';

class InstituicaoController{
  async store(req,res){
    const schema = Yup.object().shape({
      nome: Yup.string().required().test((value)=>{
        return /^[a-z\s]+$/.test(value);
      }),
    });


    if(!(await schema.isValid(req.body))){
      return res.status(400).json({error: 'Falha na validação, o nome precisa ser sem acento e com letras minusculas.'})
    }


    const instituicaoExists = await Instituicao.findOne({
      where: {nome: req.body.nome }
    });

    if(instituicaoExists){
      return res.status(400).json({ error: 'Essa instituição já existe'})
    }


    const {id , nome } = await Instituicao.create(req.body);

    return res.json({
      id,
      nome,
    });

  }
  async delete(req,res){
    const schema = Yup.object().shape({
      id:Yup.number().integer().required(),
  });

  if(!(await schema.isValid(req.body))){
    return res.status(400).json({error: 'Falha na validação, é necessário colocar o id da instituição.'})
  }

  const { id } = req.body;
  const instituicao = await Instituicao.findByPk(id);

  if(!instituicao){
    return res.status(404).json({error: 'A instituição não existe ou não foi encontrada.'});
  }
  await instituicao.destroy();
  return res.status(200).json({message: 'A instituição foi deletada com sucesso.'});
}

}

export default new InstituicaoController();
