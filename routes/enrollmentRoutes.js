const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const { enrollUsers, getEnrolledUsers } = require('../controllers/enrollmentController');

router.use(authMiddleware);

router.post('/courses/:id/enroll', authorizeRoles('admin'), enrollUsers);
router.get('/courses/:id/enrollments', authorizeRoles('admin'), getEnrolledUsers);

module.exports = router; 