// ─── Main Weighted Score Formula ─────────────────────────────────
export function calculateOverallScore(scores) {
  const {
    semantic_match_score = 0,
    github_trust_score   = 0,
    micro_test_score     = 0,
    experience_score     = 0,
    activity_score       = 0
  } = scores;

  const overall =
    (semantic_match_score * 0.35) +
    (github_trust_score   * 0.30) +
    (micro_test_score     * 0.20) +
    (experience_score     * 0.10) +
    (activity_score       * 0.05);

  return Math.round(overall * 10) / 10;
}

// ─── Experience Score (0-100) ────────────────────────────────────
export function calculateExperienceScore(yearsExperience, requiredYears) {
  if (!requiredYears || requiredYears === 0) return 70;
  const ratio = yearsExperience / requiredYears;
  if (ratio >= 2.0) return 100;
  if (ratio >= 1.5) return 90;
  if (ratio >= 1.0) return 80;
  if (ratio >= 0.8) return 65;
  if (ratio >= 0.5) return 50;
  return 30;
}

// ─── Apply Cheat Penalty ──────────────────────────────────────────
export function applyCheatPenalty(score, tabSwitches = 0, refreshCount = 0) {
  const tabPenalty     = tabSwitches * 5;
  const refreshPenalty = refreshCount * 3;
  return Math.max(0, Math.round(score - tabPenalty - refreshPenalty));
}

// ─── Rank All Candidates for a Job ───────────────────────────────
export function rankCandidates(candidates) {
  return candidates
    .sort((a, b) => b.final_scores.overall_rank_score - a.final_scores.overall_rank_score)
    .map((c, i) => ({ ...c, rank: i + 1 }));
}