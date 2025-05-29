const User = require('../models/User');
class userController {
  async store(req, res) {
    const userExists = await User.findOne({
      where: { email: req.body.email },
    });
    if (userExists) {
      return res.status(400).json({ error: 'The user already exists.' });
    }
    const { name, cpf, email } = await User.create(req.body);
    return res.json({
      name,
      cpf,
      email,
    });
  }
}
module.exports = new userController();
