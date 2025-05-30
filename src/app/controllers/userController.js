const { models } = require('../../database');
const User = models.User;
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

   async update(req,res){
    const {name, email, oldPassword, } = req.body;

    const user = await User.findByPk(req.userId);
    
    if (email !== user.email){
      const userExists = await User.findOne({
         where: {email: req.body.email},
       });

       if (userExists) {
      return res.status(400).json({ error: 'The user already exists.' });
     }
    } 
    if (oldPassword && !(await user.checkPassword(oldPassword))){
      return res.status(401).json({ error: "Password incorrect "});
    }

    const user = await user.update(req.body);

    return res.json({
      id,
      name,
      email,
    });

   }
   
 }


module.exports = new userController();
