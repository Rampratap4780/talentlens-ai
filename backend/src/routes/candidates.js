import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { generateEmbedding, sleep } from '../utils/geminiClient.js';
import { parseResume } from '../utils/resumeParser.js';
import { calculateExperienceScore, calculateOverallScore } from '../utils/scoreCalculator.js';
import Candidate from '../models/Candidate.js';
import Job from '../models/Job.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// ─── POST /api/candidates/upload ──────────────────────────────────
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    let resumeText = '';

    

    if (req.file) {
      const fileBuffer = fs.readFileSync(req.file.path);
      const pdfParse   = (await import('pdf-parse/lib/pdf-parse.js')).default;
      const pdfData    = await pdfParse(fileBuffer);
      resumeText       = pdfData.text;
      fs.unlinkSync(req.file.path);
    } else if (req.body.resume_text) {
      resumeText = req.body.resume_text;
    } else {
      return res.status(400).json({ success: false, message: 'No resume provided' });
    }

    if (resumeText.length < 50) {
      return res.status(400).json({ success: false, message: 'Resume text too short' });
    }

    // Step 1: Parse resume with Gemini
    console.log('📄 Parsing resume with AI...');
    const parsed = await parseResume(resumeText);

    // Step 2: Check if candidate already exists
    const existingCandidate = await Candidate.findOne({ email: parsed.email });
    if (existingCandidate) {
      return res.status(409).json({
        success: false,
        message: 'Candidate with this email already exists',
        candidateId: existingCandidate._id
      });
    }

    // Step 3: Generate embedding vector
    console.log('🔢 Generating embedding...');
    await sleep(1000);
    const resumeVector = await generateEmbedding(resumeText.slice(0, 8000));

    // Step 4: Calculate experience score
    const jobId = req.body.job_id;
    let experienceScore = 50;
    if (jobId) {
      const job = await Job.findById(jobId);
      if (job) {
        experienceScore = calculateExperienceScore(
          parsed.parsed_skills?.years_experience || 0,
          job.experience_required
        );
      }
    }

    // Step 5: Save to MongoDB — plain Object instead of Map ✅
    const candidate = new Candidate({
      name:            parsed.name,
      email:           parsed.email,
      phone:           parsed.phone,
      location:        parsed.location,
      github_username: parsed.github_username,
      resume_text:     resumeText,
      resume_vector:   resumeVector,
      parsed_skills:   parsed.parsed_skills,
      skill_radar: {
        claimed:  parsed.skill_radar?.claimed || {},
        verified: {}
      },
      applied_job_id: jobId || null,
      final_scores: {
        experience_score:   experienceScore,
        overall_rank_score: 0
      }
    });

    await candidate.save();

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and processed',
      candidate: {
        id:     candidate._id,
        name:   candidate.name,
        email:  candidate.email,
        skills: candidate.parsed_skills
      }
    });

  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/candidates/search?jobId=xxx ─────────────────────────
router.get('/search', async (req, res) => {
  try {
    const { jobId, limit = 10 } = req.query;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'jobId required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (!job.description_vector || job.description_vector.length === 0) {
      return res.status(400).json({ success: false, message: 'Job has no embedding' });
    }

    // Local: fetch all candidates and calculate cosine similarity manually
    const allCandidates = await Candidate.find({
      resume_vector: { $exists: true, $not: { $size: 0 } }
    }).select('-resume_text');

    // Cosine similarity function
    function cosineSimilarity(vecA, vecB) {
      if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
      let dot = 0, normA = 0, normB = 0;
      for (let i = 0; i < vecA.length; i++) {
        dot   += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
      }
      if (normA === 0 || normB === 0) return 0;
      return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    // Score every candidate
    const jobVec = job.description_vector;
    const scored = allCandidates
      .map(c => ({
        ...c.toObject(),
        _similarityScore: cosineSimilarity(c.resume_vector, jobVec)
      }))
      .sort((a, b) => b._similarityScore - a._similarityScore)
      .slice(0, parseInt(limit));

    // Format response
    const candidates = scored.map((c, index) => {
      const { resume_vector, _similarityScore, ...rest } = c;
      return {
        ...rest,
        rank: index + 1,
        final_scores: {
          ...rest.final_scores,
          semantic_match_score: Math.round(_similarityScore * 100)
        }
      };
    });

    res.json({ success: true, count: candidates.length, candidates });

  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/candidates/:id ──────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .select('-resume_vector');
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }
    res.json({ success: true, candidate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── PATCH /api/candidates/:id/status ────────────────────────────
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['applied', 'screening', 'shortlisted', 'rejected', 'hired'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-resume_vector');
    res.json({ success: true, candidate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;