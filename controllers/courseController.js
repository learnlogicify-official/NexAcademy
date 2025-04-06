const Course = require('../models/Course');
const User = require('../models/User');
const Category = require('../models/Category');

// Create a new course
exports.createCourse = async (req, res) => {
  try {
    const { title, description, difficulty, startDate, endDate, tags, instructor, category } = req.body;

    // Validate instructor exists and is an admin
    const instructorUser = await User.findById(instructor);
    if (!instructorUser || instructorUser.role !== 'admin') {
      return res.status(400).json({ message: 'Invalid instructor' });
    }

    // Validate category exists and is active
    const courseCategory = await Category.findOne({ _id: category, isActive: true });
    if (!courseCategory) {
      return res.status(400).json({ message: 'Invalid or inactive category' });
    }

    const course = await Course.create({
      title,
      description,
      difficulty,
      startDate,
      endDate,
      tags,
      instructor,
      category
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .populate('enrolledUsers', 'name email')
      .populate('category', 'name description icon');

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email')
      .populate('enrolledUsers', 'name email')
      .populate('category', 'name description icon');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Enroll user in course
exports.enrollInCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is already enrolled
    if (course.enrolledUsers.includes(req.user.id)) {
      return res.status(400).json({ message: 'User already enrolled in this course' });
    }

    // Add user to enrolledUsers array
    course.enrolledUsers.push(req.user.id);
    await course.save();

    res.status(200).json({ message: 'Successfully enrolled in course' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get enrolled courses for logged-in user
exports.getEnrolledCourses = async (req, res) => {
  try {
    const courses = await Course.find({ enrolledUsers: req.user.id })
      .populate('instructor', 'name email')
      .populate('enrolledUsers', 'name email')
      .populate('category', 'name description icon');

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 