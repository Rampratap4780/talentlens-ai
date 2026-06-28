import express from 'express';
import { fetchGitHubData, verifyGitHubVsResume, calculateActivityScore } from '../utils/githubVerifier.js';
import { calculateOverallScore } from '../utils/scoreCalculator.js';
import Candidate from '../models/Candidate.js';

const router = express.Router();

// ─── GET /api/github/:username ────────────────────────────────────
router.get('/:username', async (req, res) => {
  try {
    const data = await fetchGitHubData(req.params.username);
    res.json({ success: true, github: data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/github/:id/verify ─────────────────────────────────
router.post('/:id/verify', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    // Use cached data if fetched within last 24 hours
    if (
      candidate.github_data?.verified &&
      candidate.github_data?.fetched_at &&
      (Date.now() - new Date(candidate.github_data.fetched_at).getTime()) < 86400000
    ) {
      return res.json({
        success: true,
        message:     'Using cached data',
        github_data: candidate.github_data,
        cached:      true
      });
    }

    if (!candidate.github_username) {
      return res.status(400).json({
        success: false,
        message: 'No GitHub username for this candidate'
      });
    }

    // Step 1: Fetch from GitHub API
    console.log(`Fetching GitHub data for: ${candidate.github_username}`);
    const githubData = await fetchGitHubData(candidate.github_username);

    // Step 2: Calculate activity score
    const activityScore = calculateActivityScore({
      verified:          true,
      account_age_years: githubData.account_age_years,
      total_repos:       githubData.total_repos,
      own_repos:         githubData.own_repos,
      total_stars:       githubData.total_stars,
      top_languages:     githubData.top_languages,
      has_readme_repos:  githubData.has_readme_repos
    });

    // Step 3: Gemini verification — resume vs GitHub
    console.log('Running AI verification...');
    const verification = await verifyGitHubVsResume(
      githubData,
      candidate.parsed_skills || {}
    );

    // Step 4: Build verified skill radar
    const verifiedSkills = verification.verified_skills || {};

    // Step 5: Update candidate in DB
    const updatedGithubData = {
      verified:          true,
      top_languages:     githubData.top_languages,
      total_repos:       githubData.total_repos,
      total_stars:       githubData.total_stars,
      account_age_years: githubData.account_age_years,
      activity_score:    activityScore,
      fetched_at:        new Date()
    };

    // Step 6: Recalculate overall score
    const newScores = {
      semantic_match_score: candidate.final_scores.semantic_match_score || 0,
      github_trust_score:   verification.trust_score,
      micro_test_score:     candidate.final_scores.micro_test_score || 0,
      experience_score:     candidate.final_scores.experience_score || 0,
      activity_score:       activityScore
    };
    const overallScore = calculateOverallScore(newScores);

    await Candidate.findByIdAndUpdate(req.params.id, {
      github_data:                         updatedGithubData,
      'skill_radar.verified':              verifiedSkills,
      'final_scores.github_trust_score':   verification.trust_score,
      'final_scores.activity_score':       activityScore,
      'final_scores.overall_rank_score':   overallScore
    });

    res.json({
      success:      true,
      github_data:  updatedGithubData,
      verification: {
        trust_score:      verification.trust_score,
        discrepancies:    verification.discrepancies,
        positive_signals: verification.positive_signals,
        summary:          verification.summary
      },
      scores: {
        github_trust_score: verification.trust_score,
        activity_score:     activityScore,
        overall_score:      overallScore
      }
    });

  } catch (error) {
    console.error('GitHub verify error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;