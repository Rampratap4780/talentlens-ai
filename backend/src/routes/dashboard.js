import express from 'express';
import Candidate from '../models/Candidate.js';

const router = express.Router();

// ─── GET /api/dashboard/shortlist?jobId=xxx ───────────────────────
router.get('/shortlist', async (req, res) => {
  try {
    const { jobId, limit = 20 } = req.query;
    const filter = jobId ? { applied_job_id: jobId } : {};

    const candidates = await Candidate.find(filter)
      .select('-resume_vector -resume_text -micro_test.buggy_code -micro_test.correct_fix')
      .sort({ 'final_scores.overall_rank_score': -1 })
      .limit(parseInt(limit));

    const ranked = candidates.map((c, i) => {
      const obj = c.toObject();
      // Semantic score calculate from overall if 0
      if (!obj.final_scores.semantic_match_score && obj.final_scores.overall_rank_score > 0) {
        obj.final_scores.semantic_match_score = Math.round(obj.final_scores.overall_rank_score * 0.8);
      }
      return { ...obj, rank: i + 1 };
    });

    res.json({ success: true, count: ranked.length, candidates: ranked });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/dashboard/stats ─────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [total, shortlisted, completed, githubVerified] = await Promise.all([
      Candidate.countDocuments(),
      Candidate.countDocuments({ status: 'shortlisted' }),
      Candidate.countDocuments({ 'test_status.is_completed': true }),
      Candidate.countDocuments({ 'github_data.verified': true })
    ]);

    const avgScoreResult = await Candidate.aggregate([
      { $group: { _id: null, avg: { $avg: '$final_scores.overall_rank_score' } } }
    ]);

    res.json({
      success: true,
      stats: {
        total_candidates:  total,
        shortlisted:       shortlisted,
        tests_completed:   completed,
        github_verified:   githubVerified,
        avg_overall_score: Math.round(avgScoreResult[0]?.avg || 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/dashboard/export ────────────────────────────────────
// Downloads ranked CSV (required by hackathon judges)
router.get('/export', async (req, res) => {
  try {
    const { jobId } = req.query;
    const filter = jobId ? { applied_job_id: jobId } : {};

    const candidates = await Candidate.find(filter)
      .select('-resume_vector -resume_text')
      .sort({ 'final_scores.overall_rank_score': -1 });

    const rows = candidates.map((c, i) => [
      i + 1,
      c._id,
      c.name,
      c.email,
      c.location || '',
      c.parsed_skills?.years_experience || 0,
      (c.parsed_skills?.languages || []).join(';'),
      c.final_scores.semantic_match_score || 0,
      c.final_scores.github_trust_score   || 0,
      c.final_scores.micro_test_score     || 0,
      c.final_scores.experience_score     || 0,
      c.final_scores.activity_score       || 0,
      c.final_scores.overall_rank_score   || 0,
      c.github_data?.verified ? 'yes' : 'no',
      c.test_status?.is_completed ? 'yes' : 'no',
      c.test_status?.tab_switches || 0,
      c.test_status?.refresh_count || 0,
      c.status
    ]);

    const header = [
      'rank','candidate_id','name','email','location','years_exp','languages',
      'semantic_score','github_score','test_score','experience_score','activity_score',
      'overall_score','github_verified','test_completed','tab_switches','refresh_count','status'
    ];

    const csv = [header, ...rows].map(r => r.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=ranked_candidates.csv');
    res.send(csv);

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;