const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create category (admin only)
router.post('/', authorizeRoles('admin'), createCategory);

// Get all categories (admin and student)
router.get('/', getAllCategories);

// Get category by ID (admin and student)
router.get('/:id', getCategoryById);

// Update category (admin only)
router.put('/:id', authorizeRoles('admin'), updateCategory);

// Delete category (admin only)
router.delete('/:id', authorizeRoles('admin'), deleteCategory);

module.exports = router; 