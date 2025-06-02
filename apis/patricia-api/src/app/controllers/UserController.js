import *as Yup from 'yup';
import {cpfSchema} from '../controllers/cpf.js';

import User from './models/User.js'

class UserController {
  async store(req, res){
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      cpf: cpfSchema,
      password: Yup.string().required().min(6),
    });

    if(!(await schema.isValid(req.body))){
      return res.status(400).json({error: 'Falha na validação.'})
    }
    const userExists = await User.findOne({
      where: { cpf: req.body.cpf}
    });

    if(userExists){
      return res.status(400).json({error: 'Usuário já existe.'});
    }

    const {name, cpf} = await User.create(req.body);

    return res.json({
      name,
      cpf,
    });
  }
  async update(req,res){

    const schema = Yup.object().shape({
      name: Yup.string(),
      oldPassword: Yup.string(),
      password: Yup.string().min(6).when('oldPassword', {
        is: (val) => !!val,
        then: (schema) => schema.required(),
        otherwise: (schema) => schema.notRequired(),
      }),
      confirmPassword: Yup.string().when('password', {
        is: (val) => !!val,
        then: (schema) => schema.required().oneOf([Yup.ref('password')], 'As senhas não são as mesmas.'),
        otherwise: (schema) => schema.notRequired(),
      }),
    });

    if(!(await schema.isValid(req.body))){
      return res.status(400).json({error: 'Falha na validação.'})
    }

    const { oldPassword } = req.body;
    const user = await User.findByPk(req.userId);

  if (!user){
    return res.status(404).json({error: 'Usuário não foi encontrado'});
  }

  if(req.body.oldPassword && !(await user.checkPassword(req.body.oldPassword))){
    return res.status(401).json({error: 'Senha antiga incorreta.'});
  }

  if(req.body.password && await user.checkPassword(req.body.password)){
    return res.status(400).json({error: 'A sua nova senha, não pode ser igual a senha antiga.'})
  }

  const { id, name  } = await user.update(req.body);
    return res.json({
      message: 'Dados alterados com sucesso.',
      id,
      name,
      cpf: user.cpf,
    });
  }
}

export default new UserController();
