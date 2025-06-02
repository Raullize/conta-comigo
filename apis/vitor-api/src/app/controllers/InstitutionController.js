// src/app/controllers/InstitutionController.js
import Institution from "../models/Institution.js";

class InstitutionController {
  async store(req, res) {
    try {
      const institutionExists = await Institution.findOne({
        where: { name: req.body.name },
      });

      if (institutionExists) {
        return res.json("Essa Instituição já existe");
      }
      const institution = await Institution.create(req.body);
      return res.status(200).json(`Instituição ${req.body.name} Criada`);
    } catch (error) {
      return res
        .status(400)
        .json(
          "Falha na criação da instituição, Verifique os dados e tente novamente"
        );
    }
  }
  async listInstitutions(req, res) {
    const allInstitutions = await Institution.findAll();
    res.status(200).json(allInstitutions);
  }
  catch(error) {
    res.status(500).json("Erro ao buscar instituições");
  }
}

export default new InstitutionController();
