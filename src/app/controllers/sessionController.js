const jwt = require('jsonwebtoken');
const {
  models: { User },
} = require('../../database');
const authValidators = require('../validators/auth');

class sessionController {
  async store(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: " The user doesn't exists" });
    }
    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: ' The password is incorrect' });
    }

    const { id, name } = user;

    return res.json({
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({ id }, authValidators.secret, {
        expiresIn: authValidators.expiresIn,
      }),
    });
  }
}

module.exports = new sessionController();