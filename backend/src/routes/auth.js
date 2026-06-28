import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Simple hardcoded admin — hackathon ke liye enough
const ADMIN = {
  email:    process.env.ADMIN_EMAIL    || 'admin@talentlens.ai',
  password: process.env.ADMIN_PASSWORD || 'admin123',
  role:     'admin',
  name:     'HR Manager'
};

// Candidate accounts — DB se
import Candidate from '../models/Candidate.js';

// POST /api/auth/admin/login
router.post('/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN.email && password === ADMIN.password) {
    res.json({
      success: true,
      user: { name: ADMIN.name, email: ADMIN.email, role: 'admin' },
      token: 'admin-token-' + Date.now()
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// POST /api/auth/candidate/login
router.post('/candidate/login', async (req, res) => {
  try {
    const { email } = req.body;
    const candidate = await Candidate.findOne({ email: email.toLowerCase() })
      .select('-resume_vector -resume_text');

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'No account found. Please upload your resume first.'
      });
    }

    res.json({
      success: true,
      user: {
        id:     candidate._id,
        name:   candidate.name,
        email:  candidate.email,
        role:   'candidate'
      },
      candidate: {
        id:           candidate._id,
        name:         candidate.name,
        email:        candidate.email,
        status:       candidate.status,
        final_scores: candidate.final_scores,
        parsed_skills: candidate.parsed_skills,
        test_completed: candidate.test_status?.is_completed
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/auth/candidate/register — resume upload ke baad auto register
router.post('/candidate/check', async (req, res) => {
  try {
    const { email } = req.body;
    const candidate = await Candidate.findOne({ email: email.toLowerCase() });
    res.json({ exists: !!candidate, candidate: candidate ? { id: candidate._id, name: candidate.name } : null });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;