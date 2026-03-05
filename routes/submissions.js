const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Question = require('../models/Question');
const { protect } = require('../middleware/auth');
const { evaluateCodeAnswer, evaluateOpenEndedAnswer } = require('../services/openaiService');

router.post('/', protect, async (req, res) => {
  try {
    const { interviewId, questionId, type, code, language, textAnswer, selectedOption, timeTaken } =
      req.body;

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const submission = await Submission.create({
      interview: interviewId,
      question: questionId,
      candidate: req.user._id,
      type,
      code,
      language,
      textAnswer,
      selectedOption,
      timeTaken,
      status: 'pending',
    });

    let aiEvaluation = null;
    let score = 0;
    let isCorrect = false;

    try {
      if (type === 'coding' && code) {
        aiEvaluation = await evaluateCodeAnswer({
          question: question.text,
          code,
          language: language || question.language,
          testResults: [],
        });
        score = aiEvaluation.score || 0;
      } else if (type === 'open-ended' && textAnswer) {
        aiEvaluation = await evaluateOpenEndedAnswer({
          question: question.text,
          answer: textAnswer,
          expectedAnswer: question.expectedAnswer,
        });
        score = aiEvaluation.score || 0;
      } else if (type === 'mcq' && selectedOption !== undefined) {
        const correctOption = question.options.findIndex((o) => o.isCorrect);
        isCorrect = selectedOption === correctOption;
        score = isCorrect ? question.points : 0;
      }
    } catch (aiErr) {
      console.error('AI evaluation error:', aiErr.message);
    }

    const updated = await Submission.findByIdAndUpdate(
      submission._id,
      { aiEvaluation, score, isCorrect, status: 'evaluated' },
      { new: true }
    ).populate('question');

    res.status(201).json({ submission: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/interview/:interviewId', protect, async (req, res) => {
  try {
    const submissions = await Submission.find({ interview: req.params.interviewId })
      .populate('question')
      .populate('candidate', 'name email avatar')
      .sort({ createdAt: 1 });
    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('question')
      .populate('candidate', 'name email');
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    res.json({ submission });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
