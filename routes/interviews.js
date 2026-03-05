const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Interview = require('../models/Interview');
const Question = require('../models/Question');
const Submission = require('../models/Submission');
const { protect, authorize } = require('../middleware/auth');
const { generateInterviewSummary } = require('../services/openaiService');

router.post('/', protect, authorize('interviewer', 'admin'), async (req, res) => {
  try {
    const { title, description, type, candidateEmail, scheduledAt, questions, tags } = req.body;
    const interview = await Interview.create({
      title,
      description,
      type,
      candidateEmail,
      scheduledAt,
      questions,
      tags,
      interviewer: req.user._id,
      roomId: uuidv4(),
    });
    res.status(201).json({ interview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    const query = {};
    if (req.user.role === 'interviewer') query.interviewer = req.user._id;
    else if (req.user.role === 'candidate') query.candidate = req.user._id;
    if (status) query.status = status;
    if (type) query.type = type;

    const interviews = await Interview.find(query)
      .populate('interviewer', 'name email avatar')
      .populate('candidate', 'name email avatar')
      .populate('questions')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    const total = await Interview.countDocuments(query);
    res.json({ interviews, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('interviewer', 'name email avatar')
      .populate('candidate', 'name email avatar')
      .populate('questions');
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    res.json({ interview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/room/:roomId', protect, async (req, res) => {
  try {
    const interview = await Interview.findOne({ roomId: req.params.roomId })
      .populate('interviewer', 'name email avatar')
      .populate('candidate', 'name email avatar')
      .populate('questions');
    if (!interview) return res.status(404).json({ error: 'Interview room not found' });
    res.json({ interview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    if (
      interview.interviewer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const updated = await Interview.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('questions');
    res.json({ interview: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/start', protect, async (req, res) => {
  try {
    const interview = await Interview.findByIdAndUpdate(
      req.params.id,
      { status: 'in-progress', startedAt: new Date() },
      { new: true }
    );
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    res.json({ interview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/complete', protect, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id).populate('questions');
    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    const submissions = await Submission.find({ interview: req.params.id }).populate('question');

    let aiEvaluation = null;
    let overallScore = 0;
    if (submissions.length > 0) {
      try {
        aiEvaluation = await generateInterviewSummary({ interview, submissions });
        overallScore = aiEvaluation.overallScore || 0;
      } catch (aiErr) {
        console.error('AI evaluation error:', aiErr.message);
      }
    }

    const duration = interview.startedAt
      ? Math.round((Date.now() - interview.startedAt.getTime()) / 60000)
      : 0;

    const updated = await Interview.findByIdAndUpdate(
      req.params.id,
      {
        status: 'completed',
        completedAt: new Date(),
        duration,
        aiEvaluation,
        overallScore,
      },
      { new: true }
    );
    res.json({ interview: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', protect, authorize('interviewer', 'admin'), async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    if (
      interview.interviewer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await interview.deleteOne();
    res.json({ message: 'Interview deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
