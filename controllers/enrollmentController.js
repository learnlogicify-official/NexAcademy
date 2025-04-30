const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const Course = require('../models/Course');

// Enroll multiple users in a course
exports.enrollUsers = async (req, res) => {
  const { userIds } = req.body;
  const { id: courseId } = req.params;
  const adminId = req.user.id;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ message: 'No users selected' });
  }

  try {
    const enrollments = await Promise.all(userIds.map(async (userId) => {
      // Prevent duplicate enrollments
      const exists = await Enrollment.findOne({ userId, courseId });
      if (exists) return null;
      return Enrollment.create({ userId, courseId, enrolledBy: adminId });
    }));

    res.status(200).json({
      message: 'Users enrolled successfully',
      enrollments: enrollments.filter(Boolean)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// List enrolled users for a course
exports.getEnrolledUsers = async (req, res) => {
  const { id: courseId } = req.params;
  try {
    const enrollments = await Enrollment.find({ courseId }).populate('userId', 'name email');
    res.status(200).json({ users: enrollments.map(e => e.userId) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 