import jwt from 'jsonwebtoken';
import {promisify} from 'util';
import authConfig from '../../config/auth.js';
import User from '../controllers/models/User.js';

export default async (req,res,next) => {
  const authHeader = req.headers.authorization;

  if(!authHeader){
    return res.status(401).json ({error: 'Token não existe.'});
  }

  const [, token] = authHeader.split(' ');

try{

  const decoded = await promisify(jwt.verify)(token, authConfig.secret);

  const user = await User.findByPk(decoded.id); //adicionei mais esse pedaço pra pegar o user como um todo
  if (!user){
    return res.status(401).json({ error: 'Usuário do token não encontrado'});
  }

  req.userId = decoded.id;
  req.userCpf = user.cpf; //aqui to puxando o cpf pro request tbm 
  return next();

} catch (error){
  return res.status(401).json({error: 'token inválido.'});
}

};

