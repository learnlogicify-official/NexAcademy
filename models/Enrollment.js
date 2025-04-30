const mongoose = require('mongoose');
const { Schema } = mongoose;

const enrollmentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  enrolledAt: { type: Date, default: Date.now },
  enrolledBy: { type: Schema.Types.ObjectId, ref: 'User' }, // Admin who enrolled
  status: { type: String, default: 'active' }
});

enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema); 