const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const Submission = require('../models/Submission');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const [totalUsers, totalInterviews, completedInterviews, totalSubmissions] = await Promise.all([
      User.countDocuments(),
      Interview.countDocuments(),
      Interview.countDocuments({ status: 'completed' }),
      Submission.countDocuments(),
    ]);

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    const interviewsByType = await Interview.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    const interviewsByStatus = await Interview.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const avgScoreResult = await Interview.aggregate([
      { $match: { status: 'completed', overallScore: { $exists: true, $gt: 0 } } },
      { $group: { _id: null, avgScore: { $avg: '$overallScore' } } },
    ]);

    const recentInterviews = await Interview.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('interviewer', 'name')
      .populate('candidate', 'name');

    const monthlyInterviews = await Interview.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    res.json({
      stats: {
        totalUsers,
        totalInterviews,
        completedInterviews,
        totalSubmissions,
        averageScore: avgScoreResult[0]?.avgScore?.toFixed(1) || 0,
        completionRate: totalInterviews
          ? ((completedInterviews / totalInterviews) * 100).toFixed(1)
          : 0,
      },
      usersByRole,
      interviewsByType,
      interviewsByStatus,
      recentInterviews,
      monthlyInterviews,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/interviewer', protect, authorize('interviewer', 'admin'), async (req, res) => {
  try {
    const userId = req.user._id;
    const [total, completed, inProgress] = await Promise.all([
      Interview.countDocuments({ interviewer: userId }),
      Interview.countDocuments({ interviewer: userId, status: 'completed' }),
      Interview.countDocuments({ interviewer: userId, status: 'in-progress' }),
    ]);

    const avgScoreResult = await Interview.aggregate([
      { $match: { interviewer: userId, status: 'completed', overallScore: { $gt: 0 } } },
      { $group: { _id: null, avgScore: { $avg: '$overallScore' } } },
    ]);

    const recentInterviews = await Interview.find({ interviewer: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('candidate', 'name email');

    const scoreDistribution = await Interview.aggregate([
      { $match: { interviewer: userId, status: 'completed' } },
      {
        $bucket: {
          groupBy: '$overallScore',
          boundaries: [0, 20, 40, 60, 80, 100],
          default: 'Other',
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    res.json({
      stats: { total, completed, inProgress, averageScore: avgScoreResult[0]?.avgScore?.toFixed(1) || 0 },
      recentInterviews,
      scoreDistribution,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/candidate', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const [total, completed] = await Promise.all([
      Interview.countDocuments({ candidate: userId }),
      Interview.countDocuments({ candidate: userId, status: 'completed' }),
    ]);

    const submissions = await Submission.find({ candidate: userId }).populate('question', 'type difficulty');

    const avgScore = submissions.length
      ? (submissions.reduce((a, s) => a + (s.score || 0), 0) / submissions.length).toFixed(1)
      : 0;

    const byType = submissions.reduce((acc, s) => {
      acc[s.type] = (acc[s.type] || 0) + 1;
      return acc;
    }, {});

    const recentInterviews = await Interview.find({ candidate: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('interviewer', 'name');

    res.json({
      stats: { total, completed, totalSubmissions: submissions.length, averageScore: avgScore },
      submissionsByType: byType,
      recentInterviews,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
