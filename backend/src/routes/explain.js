import express from 'express';
import { generateText } from '../utils/geminiClient.js';
import Candidate from '../models/Candidate.js';
import Job from '../models/Job.js';

const router = express.Router();

// POST /api/explain/candidate/:id
router.post('/candidate/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .select('-resume_vector');
    
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    const job = candidate.applied_job_id 
      ? await Job.findById(candidate.applied_job_id).select('-description_vector')
      : null;

    const prompt = `
You are an expert technical recruiter at Redrob AI.
Analyze this candidate for the role of ${job?.title || 'Senior AI Engineer'}.

JOB REQUIREMENTS:
- Embeddings, Vector Search, RAG, LLMs, Fine-tuning
- Python, PyTorch, Elasticsearch, FAISS, Pinecone
- 5-9 years experience preferred
- Location: Pune/Noida/Hyderabad preferred

CANDIDATE: ${candidate.name}
Location: ${candidate.location}
Experience: ${candidate.parsed_skills?.years_experience} years

VERIFIED SKILLS:
Languages: ${(candidate.parsed_skills?.languages || []).join(', ') || 'Not specified'}
Frameworks: ${(candidate.parsed_skills?.frameworks || []).join(', ') || 'Not specified'}  
Tools: ${(candidate.parsed_skills?.tools || []).join(', ') || 'Not specified'}
Domains: ${(candidate.parsed_skills?.domains || []).join(', ') || 'Not specified'}
Top Skill: ${candidate.parsed_skills?.top_skill || 'Not specified'}

SKILL RATINGS (self-assessed 1-10):
${Object.entries(candidate.skill_radar?.claimed || {}).map(([k,v]) => `${k}: ${v}/10`).join(', ')}

PERFORMANCE SCORES:
Overall Rank Score: ${candidate.final_scores?.overall_rank_score}/100
Semantic Match: ${candidate.final_scores?.semantic_match_score}/100
GitHub Trust: ${candidate.final_scores?.github_trust_score}/100
Experience Score: ${candidate.final_scores?.experience_score}/100
Activity Score: ${candidate.final_scores?.activity_score}/100
Current Status: ${candidate.status}

BEHAVIORAL SIGNALS:
GitHub Verified: ${candidate.github_data?.verified ? 'Yes' : 'Pending'}
Test Completed: ${candidate.test_status?.is_completed ? 'Yes' : 'No'}
Tab Switches: ${candidate.test_status?.tab_switches || 0}

Note: Overall score of ${candidate.final_scores?.overall_rank_score}/100 is based on 
multi-signal analysis including behavioral data, platform activity, and career trajectory.
High scores indicate strong fit based on comprehensive analysis.

Write a 3-4 sentence recruiter assessment. Be honest and specific.
Format:
Line 1: Verdict (Strong Fit / Good Fit / Possible Fit / Not a Fit)
Line 2-3: Top reasons for/against
Line 4: Hiring recommendation
`;

    const explanation = await generateText(prompt);

    // Save explanation to DB
    await Candidate.findByIdAndUpdate(req.params.id, {
      'ai_explanation': explanation,
      'explanation_generated_at': new Date()
    });

    res.json({ 
      success: true, 
      candidate_id: req.params.id,
      name: candidate.name,
      explanation 
    });

  } catch (error) {
    console.error('Explain error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/explain/compare
router.post('/compare', async (req, res) => {
  try {
    const { candidate_id_1, candidate_id_2, job_id } = req.body;

    const [c1, c2, job] = await Promise.all([
      Candidate.findById(candidate_id_1).select('-resume_vector'),
      Candidate.findById(candidate_id_2).select('-resume_vector'),
      job_id ? Job.findById(job_id).select('-description_vector') : null
    ]);

    if (!c1 || !c2) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    const prompt = `
You are a senior technical recruiter. Compare these two candidates for the role of ${job?.title || 'Senior AI Engineer'}.

CANDIDATE 1: ${c1.name}
- Experience: ${c1.parsed_skills?.years_experience} years
- Skills: ${[...(c1.parsed_skills?.languages || []), ...(c1.parsed_skills?.frameworks || [])].slice(0, 6).join(', ')}
- Overall Score: ${c1.final_scores?.overall_rank_score}/100
- Skill Match: ${c1.final_scores?.semantic_match_score}/100
- Status: ${c1.status}
- Location: ${c1.location}

CANDIDATE 2: ${c2.name}
- Experience: ${c2.parsed_skills?.years_experience} years  
- Skills: ${[...(c2.parsed_skills?.languages || []), ...(c2.parsed_skills?.frameworks || [])].slice(0, 6).join(', ')}
- Overall Score: ${c2.final_scores?.overall_rank_score}/100
- Skill Match: ${c2.final_scores?.semantic_match_score}/100
- Status: ${c2.status}
- Location: ${c2.location}

Provide a head-to-head comparison. Format your response as JSON:
{
  "winner": "Name of better candidate",
  "winner_reason": "One sentence why they win",
  "candidate1_strengths": ["strength 1", "strength 2"],
  "candidate1_weaknesses": ["weakness 1"],
  "candidate2_strengths": ["strength 1", "strength 2"],
  "candidate2_weaknesses": ["weakness 1"],
  "recommendation": "Who to interview first and why — one sentence",
  "interview_order": 1 or 2
}
`;

    const raw = await generateText(prompt);
    const cleaned = raw.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    const comparison = JSON.parse(cleaned);

    res.json({ 
      success: true,
      candidate1: { id: candidate_id_1, name: c1.name },
      candidate2: { id: candidate_id_2, name: c2.name },
      comparison 
    });

  } catch (error) {
    console.error('Compare error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;