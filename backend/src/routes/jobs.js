import express from 'express';
import { generateEmbedding, sleep } from '../utils/geminiClient.js';
import Job from '../models/Job.js';
import Candidate from '../models/Candidate.js';

const router = express.Router();

// ─── POST /api/jobs/create ────────────────────────────────────────
router.post('/create', async (req, res) => {
  try {
    const {
      title, company, description,
      required_skills, preferred_skills,
      experience_required, location, job_type
    } = req.body;

    if (!title || !company || !description) {
      return res.status(400).json({
        success: false,
        message: 'title, company, and description are required'
      });
    }

    // Generate embedding for the job description
    console.log('🔢 Embedding job description...');
    await sleep(1000);
    const descriptionVector = await generateEmbedding(description.slice(0, 8000));

    const job = new Job({
      title, company, description,
      required_skills:     required_skills || [],
      preferred_skills:    preferred_skills || [],
      experience_required: experience_required || 0,
      location, job_type,
      description_vector: descriptionVector
    });

    await job.save();

    res.status(201).json({
      success: true,
      message: 'Job created and embedded',
      job: {
        id:          job._id,
        title:       job.title,
        company:     job.company,
        vectorReady: job.description_vector.length > 0
      }
    });

  } catch (error) {
    console.error('Job create error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/jobs/:id ────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).select('-description_vector');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/jobs/:id/ranked ─────────────────────────────────────
router.get('/:id/ranked', async (req, res) => {
  try {
    const candidates = await Candidate.find({ applied_job_id: req.params.id })
      .select('-resume_vector -resume_text')
      .sort({ 'final_scores.overall_rank_score': -1 });

    const ranked = candidates.map((c, i) => ({ ...c.toObject(), rank: i + 1 }));
    res.json({ success: true, count: ranked.length, candidates: ranked });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
