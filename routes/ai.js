const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { generateQuestions, evaluateCodeAnswer, evaluateOpenEndedAnswer } = require('../services/openaiService');

router.post('/generate-questions', protect, authorize('interviewer', 'admin'), async (req, res) => {
  try {
    const { jobRole, skills, difficulty, type, count } = req.body;
    if (!jobRole || !skills?.length) {
      return res.status(400).json({ error: 'jobRole and skills are required' });
    }
    const questions = await generateQuestions({ jobRole, skills, difficulty, type, count });
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/evaluate-code', protect, async (req, res) => {
  try {
    const { question, code, language, testResults } = req.body;
    if (!question || !code) return res.status(400).json({ error: 'question and code are required' });
    const evaluation = await evaluateCodeAnswer({ question, code, language, testResults: testResults || [] });
    res.json({ evaluation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/evaluate-answer', protect, async (req, res) => {
  try {
    const { question, answer, expectedAnswer } = req.body;
    if (!question || !answer) return res.status(400).json({ error: 'question and answer are required' });
    const evaluation = await evaluateOpenEndedAnswer({ question, answer, expectedAnswer });
    res.json({ evaluation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
