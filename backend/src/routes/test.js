import express from 'express';
import { generateJSON, generateText, sleep } from '../utils/geminiClient.js';
import { applyCheatPenalty, calculateOverallScore } from '../utils/scoreCalculator.js';
import Candidate from '../models/Candidate.js';

const router = express.Router();

// ─── POST /api/test/start ─────────────────────────────────────────
router.post('/start', async (req, res) => {
  try {
    const { candidate_id } = req.body;
    const candidate = await Candidate.findById(candidate_id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    // Track attempts and increase difficulty if refreshing to cheat
    const newAttempts       = (candidate.test_status.attempts || 0) + 1;
    const newRefreshCount   = candidate.test_status.is_started && !candidate.test_status.is_completed
      ? candidate.test_status.refresh_count + 1
      : candidate.test_status.refresh_count;

    // Difficulty increases with each restart
    let difficulty = 1;
    if (newRefreshCount >= 3) difficulty = 3;
    else if (newRefreshCount >= 1) difficulty = 2;

    const difficultyDesc = {
      1: 'simple logic error like off-by-one or wrong operator',
      2: 'subtle type error, async bug, or incorrect edge case handling',
      3: 'algorithm inefficiency, race condition, or memory leak'
    };

    const topSkill   = candidate.parsed_skills?.top_skill || 'JavaScript';
    const languages  = candidate.parsed_skills?.languages || ['JavaScript'];
    const testLang   = languages[0] || 'JavaScript';

    // Generate unique buggy code with Gemini
    await sleep(500);
    const prompt = `
Generate a coding micro-test for a candidate whose top skill is ${topSkill}.

Requirements:
- Language: ${testLang}
- Bug type: ${difficultyDesc[difficulty]}
- Code length: exactly 8-12 lines
- Must be a realistic function a developer would actually write

Return ONLY this JSON structure:
{
  "language": "${testLang}",
  "topic": "what this function is supposed to do",
  "buggy_code": "the code with ONE subtle bug",
  "correct_fix": "the corrected version of just the buggy line(s)",
  "explanation": "what the bug is and why it breaks"
}
`;

    const question = await generateJSON(prompt);
    const questionId = `Q_${Date.now()}_${candidate_id}`;

    // Lock test session in DB
    await Candidate.findByIdAndUpdate(candidate_id, {
      'test_status.is_started':       true,
      'test_status.is_completed':     false,
      'test_status.start_time':       new Date(),
      'test_status.refresh_count':    newRefreshCount,
      'test_status.difficulty_level': difficulty,
      'test_status.attempts':         newAttempts,
      'micro_test.question_id':       questionId,
      'micro_test.language':          question.language,
      'micro_test.buggy_code':        question.buggy_code,
      'micro_test.correct_fix':       question.correct_fix
    });

    res.json({
      success: true,
      test: {
        question_id:      questionId,
        language:         question.language,
        topic:            question.topic,
        buggy_code:       question.buggy_code,
        time_limit:       60,
        difficulty_level: difficulty,
        refresh_count:    newRefreshCount
      }
    });

  } catch (error) {
    console.error('Test start error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/test/submit ────────────────────────────────────────
router.post('/submit', async (req, res) => {
  try {
    const { candidate_id, answer, time_taken_seconds } = req.body;

    const candidate = await Candidate.findById(candidate_id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    // Server-side time validation (65s grace period)
    if (time_taken_seconds > 65) {
      await Candidate.findByIdAndUpdate(candidate_id, {
        'test_status.is_completed':    true,
        'micro_test.candidate_answer': answer,
        'micro_test.time_taken_seconds': time_taken_seconds,
        'micro_test.is_correct':       false,
        'final_scores.micro_test_score': 0
      });
      return res.json({
        success: true,
        result: { score: 0, is_correct: false, reason: 'Time limit exceeded' }
      });
    }

    // Use Gemini to evaluate the answer
    const evalPrompt = `
You are evaluating a coding test answer.

ORIGINAL BUGGY CODE:
${candidate.micro_test.buggy_code}

THE CORRECT FIX:
${candidate.micro_test.correct_fix}

CANDIDATE'S ANSWER:
${answer}

Evaluate and return ONLY JSON:
{
  "is_correct": true or false,
  "score": 0-100,
  "feedback": "brief explanation of what they did right or wrong"
}

Scoring rules:
- Identified AND fixed the bug correctly: 85-100
- Fixed the bug but with slightly different approach: 70-84
- Identified the bug location but fix is incomplete: 40-69
- Wrong answer: 0-39
- Time taken: ${time_taken_seconds}s (bonus 10 points if under 30s, penalty 10 if over 50s)
`;

    await sleep(500);
    const evaluation = await generateJSON(evalPrompt);

    // Apply anti-cheat score penalties
    const penalizedScore = applyCheatPenalty(
      evaluation.score,
      candidate.test_status.tab_switches,
      candidate.test_status.refresh_count
    );

    // Update candidate with test results
    await Candidate.findByIdAndUpdate(candidate_id, {
      'test_status.is_completed':        true,
      'test_status.end_time':            new Date(),
      'micro_test.candidate_answer':     answer,
      'micro_test.time_taken_seconds':   time_taken_seconds,
      'micro_test.is_correct':           evaluation.is_correct,
      'final_scores.micro_test_score':   penalizedScore
    });

    // Recalculate overall score now that test is done
    const updated = await Candidate.findById(candidate_id);
    const overallScore = calculateOverallScore(updated.final_scores);
    await Candidate.findByIdAndUpdate(candidate_id, {
      'final_scores.overall_rank_score': overallScore
    });

    res.json({
      success: true,
      result: {
        is_correct:    evaluation.is_correct,
        raw_score:     evaluation.score,
        final_score:   penalizedScore,
        feedback:      evaluation.feedback,
        penalties: {
          tab_switches:  candidate.test_status.tab_switches,
          refresh_count: candidate.test_status.refresh_count
        }
      }
    });

  } catch (error) {
    console.error('Test submit error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/test/penalty ───────────────────────────────────────
// Called from frontend when tab switch is detected
router.post('/penalty', async (req, res) => {
  try {
    const { candidate_id } = req.body;
    const candidate = await Candidate.findByIdAndUpdate(
      candidate_id,
      { $inc: { 'test_status.tab_switches': 1 } },
      { new: true }
    );
    res.json({
      success: true,
      tab_switches: candidate.test_status.tab_switches
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/jobs — all active jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({ is_active: true })
      .select('-description_vector')
      .sort({ createdAt: -1 })
    res.json({ success: true, count: jobs.length, jobs })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
});

export default router;