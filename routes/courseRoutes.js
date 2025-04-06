const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const {
  createCourse,
  getAllCourses,
  getCourseById,
  enrollInCourse,
  getEnrolledCourses
} = require('../controllers/courseController');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create course (admin only)
router.post('/', authorizeRoles('admin'), createCourse);

// Get all courses (admin and student)
router.get('/', getAllCourses);

// Get course by ID (admin and student)
router.get('/:id', getCourseById);

// Enroll in course (admin and student)
router.post('/:id/enroll', enrollInCourse);

// Get enrolled courses (student)
router.get('/users/me/enrolled-courses', authorizeRoles('student'), getEnrolledCourses);

module.exports = router; 