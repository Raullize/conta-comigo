import jwt from 'jsonwebtoken';
import User from '../controllers/models/User.js'

import authConfig from '../../config/auth.js'


class SessionController{
  async store(req,res){
    const {cpf,password} = req.body;

    //verificação de cpf
    const user = await User.findOne({ where: { cpf } });
    if(!user){
      return res.status(401).json({ error: 'Usuário não existe. '});
    }
    //verificação de senha
    if(!(await user.checkPassword(password))){
      return res.status(401).json({error: 'Senha incorreta.'});
    }
    const {id, name}= user;



    return res.json({
      user: {
        id,
        name,
        cpf,
      },
      token: jwt.sign({ id }, authConfig.secret,{
        expiresIn: authConfig.expiresIn,
      }),
     });
  }

}

export default new SessionController();
