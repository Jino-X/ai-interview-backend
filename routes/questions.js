const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('interviewer', 'admin'), async (req, res) => {
  try {
    const question = await Question.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ question });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/bulk', protect, authorize('interviewer', 'admin'), async (req, res) => {
  try {
    const { questions } = req.body;
    const created = await Question.insertMany(
      questions.map((q) => ({ ...q, createdBy: req.user._id }))
    );
    res.status(201).json({ questions: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, difficulty, category, tags, search } = req.query;
    const query = {};
    if (req.user.role !== 'admin') {
      query.$or = [{ createdBy: req.user._id }, { isPublic: true }];
    }
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;
    if (tags) query.tags = { $in: tags.split(',') };
    if (search) query.text = { $regex: search, $options: 'i' };

    const questions = await Question.find(query)
      .populate('createdBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    const total = await Question.countDocuments(query);
    res.json({ questions, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate('createdBy', 'name email');
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json({ question });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    if (question.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const updated = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json({ question: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    if (question.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await question.deleteOne();
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
