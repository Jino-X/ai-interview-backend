const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    interview: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['coding', 'mcq', 'open-ended', 'system-design'], required: true },
    code: { type: String },
    language: { type: String },
    textAnswer: { type: String },
    selectedOption: { type: Number },
    status: {
      type: String,
      enum: ['pending', 'running', 'passed', 'failed', 'error', 'evaluated'],
      default: 'pending',
    },
    testResults: [
      {
        input: String,
        expectedOutput: String,
        actualOutput: String,
        passed: Boolean,
        executionTime: Number,
      },
    ],
    score: { type: Number, min: 0, max: 100 },
    timeTaken: { type: Number },
    aiEvaluation: {
      score: Number,
      feedback: String,
      codeQuality: Number,
      correctness: Number,
      efficiency: Number,
      readability: Number,
      suggestions: [String],
    },
    isCorrect: { type: Boolean },
  },
  { timestamps: true }
);

submissionSchema.index({ interview: 1, candidate: 1 });
submissionSchema.index({ question: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
