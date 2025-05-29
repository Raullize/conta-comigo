const jwt = require('jsonwebtoken');
const { models: { User } } = require('../../database');

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
      token: jwt.sign({ id }, '92f52e6e1014c8041228bdbc7173649f', {
        expiresIn: '7d',
      }),
    });
  }
}

module.exports = new sessionController();
