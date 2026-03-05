const express = require('express');
const router = express.Router();
const fs = require('fs');
const pdfParse = require('pdf-parse');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { parseResume } = require('../services/openaiService');

router.post('/upload', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filePath = req.file.path;
    let resumeText = '';

    const ext = req.file.originalname.split('.').pop().toLowerCase();
    if (ext === 'pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      resumeText = data.text;
    } else {
      resumeText = fs.readFileSync(filePath, 'utf8');
    }

    let parsedData = {};
    try {
      parsedData = await parseResume(resumeText);
    } catch (aiErr) {
      console.error('Resume parsing AI error:', aiErr.message);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        resumeUrl: `/uploads/${req.file.filename}`,
        resumeParsed: {
          skills: parsedData.skills || [],
          education: parsedData.education || [],
          experience: parsedData.experience || [],
          summary: parsedData.summary || '',
        },
        skills: parsedData.skills || [],
      },
      { new: true }
    );

    fs.unlinkSync(filePath);

    res.json({ user, parsedData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/parsed', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('resumeParsed resumeUrl skills');
    res.json({ resumeData: user.resumeParsed, resumeUrl: user.resumeUrl, skills: user.skills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
