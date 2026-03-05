const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    interview: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    type: {
      type: String,
      enum: ['coding', 'mcq', 'open-ended', 'system-design'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    category: { type: String },
    tags: [String],
    codeTemplate: { type: String },
    language: { type: String, default: 'javascript' },
    testCases: [
      {
        input: String,
        expectedOutput: String,
        isHidden: { type: Boolean, default: false },
      },
    ],
    options: [
      {
        text: String,
        isCorrect: Boolean,
      },
    ],
    expectedAnswer: { type: String },
    timeLimit: { type: Number, default: 30 },
    points: { type: Number, default: 10 },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

questionSchema.index({ tags: 1, difficulty: 1 });
questionSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Question', questionSchema);
