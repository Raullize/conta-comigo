const { models } = require('../../database');
const Category = models.Category;
class categoryController {
  async createCategory(req, res) {
    const categoryExists = await Category.findOne({
      where: { name: req.body.name },
    });
    if (categoryExists) {
      return res.status(400).json({ error: 'The category already exists.' });
    }
    const { sector, name, description } = await Category.create(req.body);
    return res.json({
      name,
      sector,
      description,
    });
  }
}
module.exports = new categoryController();
