const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    interviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    candidateEmail: { type: String },
    type: {
      type: String,
      enum: ['technical', 'behavioral', 'system-design', 'coding', 'mixed'],
      default: 'mixed',
    },
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    scheduledAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    duration: { type: Number },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    videoRecordingUrl: { type: String },
    videoRecordingKey: { type: String },
    overallScore: { type: Number, min: 0, max: 100 },
    aiEvaluation: {
      summary: String,
      strengths: [String],
      weaknesses: [String],
      recommendation: {
        type: String,
        enum: ['strong-hire', 'hire', 'neutral', 'no-hire', 'strong-no-hire'],
      },
      technicalScore: Number,
      communicationScore: Number,
      problemSolvingScore: Number,
    },
    notes: { type: String },
    tags: [String],
    roomId: { type: String, unique: true },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

interviewSchema.index({ interviewer: 1, status: 1 });
interviewSchema.index({ candidate: 1, status: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
