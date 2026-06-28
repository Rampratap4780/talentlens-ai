import express from 'express';
import { generateJSON, generateEmbedding, sleep } from '../utils/geminiClient.js';
import Candidate from '../models/Candidate.js';
import Job from '../models/Job.js';

const router = express.Router();

// POST /api/jd/analyze
router.post('/analyze', async (req, res) => {
  try {
    const { job_description } = req.body;

    if (!job_description || job_description.length < 50) {
      return res.status(400).json({ 
        success: false, 
        message: 'Job description too short' 
      });
    }

    // Step 1: Parse JD with Gemini
    const parsePrompt = `
Analyze this job description and extract structured information.
Return ONLY valid JSON, no extra text:

{
  "title": "job title",
  "company": "company name or Unknown",
  "required_skills": ["skill1", "skill2"],
  "preferred_skills": ["skill1"],
  "experience_min": 3,
  "experience_max": 8,
  "location": "city or Remote",
  "key_responsibilities": ["resp1", "resp2", "resp3"],
  "red_flag_skills": ["skills that indicate wrong fit"],
  "summary": "2 sentence summary of ideal candidate"
}

JOB DESCRIPTION:
${job_description}
`;

    const parsed = await generateJSON(parsePrompt);

    // Step 2: Create job in DB with embedding
    await sleep(1000);
    const vector = await generateEmbedding(job_description.slice(0, 8000));

    const job = await Job.create({
      title:              parsed.title || 'New Position',
      company:            parsed.company || 'Unknown',
      description:        job_description,
      required_skills:    parsed.required_skills || [],
      preferred_skills:   parsed.preferred_skills || [],
      experience_required: parsed.experience_min || 0,
      description_vector: vector
    });

    // Step 3: Find matching candidates using cosine similarity
    const allCandidates = await Candidate.find({
      resume_vector: { $exists: true, $not: { $size: 0 } }
    }).select('-resume_text');

    function cosineSimilarity(vecA, vecB) {
      if (!vecA?.length || !vecB?.length) return 0;
      let dot = 0, normA = 0, normB = 0;
      for (let i = 0; i < Math.min(vecA.length, vecB.length); i++) {
        dot   += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
      }
      return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
    }

    const scored = allCandidates
      .map(c => ({
        _id:      c._id,
        name:     c.name,
        location: c.location,
        skills:   c.parsed_skills,
        scores:   c.final_scores,
        status:   c.status,
        similarity: cosineSimilarity(c.resume_vector, vector)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10)
      .map((c, i) => ({
        ...c,
        rank: i + 1,
        semantic_score: Math.round(c.similarity * 100)
      }));

    res.json({
      success:   true,
      job_id:    job._id,
      parsed_jd: parsed,
      top_candidates: scored
    });

  } catch (error) {
    console.error('JD parse error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;