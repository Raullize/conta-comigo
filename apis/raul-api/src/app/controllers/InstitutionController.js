import Institution from '../models/Institution.js';

class InstitutionController {
  async store(req, res) {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      // Verificar se já existe uma instituição (limitado a 1 como na API Lucas)
      const existingInstitution = await Institution.findOne();
      if (existingInstitution) {
        return res.status(400).json({ 
          error: 'An institution already exists. Only one institution is allowed.' 
        });
      }

      const institution = await Institution.create({ name });

      return res.status(201).json(institution);
    } catch (error) {
      console.error('Error creating institution:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async index(req, res) {
    try {
      const institutions = await Institution.findAll({
        order: [['created_at', 'DESC']]
      });

      return res.json(institutions);
    } catch (error) {
      console.error('Error listing institutions:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new InstitutionController(); 