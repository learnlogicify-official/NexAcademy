const Category = require('../models/Category');

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;

    const category = await Category.create({
      name,
      description,
      icon
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, icon, isActive } = req.body;
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, icon, isActive },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete category (soft delete)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 