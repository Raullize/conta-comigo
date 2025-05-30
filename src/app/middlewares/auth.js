const jwt = require('jsonwebtoken');
const {promisify} = require ('util');
const authValidators = require('../validators/auth');


module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token doesn't exists " });
  }

  const [, token] = authHeader.split(' ');

  try{
      const decoded = await promisify(jwt.verify)(token, authValidators.secret);
      
      req.userId = decoded.id;

      return next();
  }catch (err){
    return res.status(401).json({ error: "Token invalid " });
  }
  return next();
};
