import User from "../models/User.js";

class UserController {
  async createUser(req, res) {
    try {
      const userExists = await User.findOne({
        where: { cpf: req.body.cpf },
      });

      if (userExists) {
        return res.json("O Usuario Já Existe");
      }

      const user = await User.create(req.body);
      return res.json("Usuario Criado");
    } catch (error) {
      res.status(200).json("Erro, Verifique os campos e tente novamente");
    }
  }
  async listUsers(req, res) {
    const allUsers = await User.findAll();
    res.status(200).json(allUsers);
  }
  catch(error) {
    res.status(500).json("Erro ao buscar usuários");
  }
}

export default new UserController();
