const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const authValidators = require('../validators/authConfig');

module.exports = async (req, res, next) => {
  console.log('=== Auth Middleware called ===');
  console.log('Request URL:', req.url);
  console.log('Request method:', req.method);
  
  const authHeader = req.headers.authorization;
  console.log('Auth header:', authHeader ? 'Present' : 'Missing');

  if (!authHeader) {
    console.log('No auth header found');
    return res.status(401).json({ error: "Token doesn't exists " });
  }

  const [, token] = authHeader.split(' ');
  console.log('Token extracted:', token ? 'Token present' : 'No token');

  try {
    const decoded = await promisify(jwt.verify)(token, authValidators.secret);
    console.log('Token decoded successfully:', decoded);

    req.userId = decoded.id;
    req.user = decoded; // Usar o objeto decoded completo
    
    console.log('req.user set to:', req.user);

    return next();
  } catch (err) {
    console.log('Token verification failed:', err.message);
    return res.status(401).json({ error: 'Token invalid ' });
  }
  return next();
};
