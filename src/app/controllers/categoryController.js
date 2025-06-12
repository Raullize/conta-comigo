const { models } = require('../../database');
const Category = models.Category;

class CategoryController {
  // ← Nome da classe em PascalCase
  async createCategory(req, res) {
    const categoryExists = await Category.findOne({
      where: { name: req.body.name },
    });

    if (categoryExists) {
      return res.status(400).json({ error: 'The category already exists.' });
    }

    const category = await Category.create(req.body);

    return res.json({
      name: category.name,
      sector: category.sector,
      description: category.description,
    });
  }
}

module.exports = new CategoryController(); // ← Exportação corrigida
