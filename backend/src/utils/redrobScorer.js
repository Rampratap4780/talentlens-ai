// ─────────────────────────────────────────────────────────────────
// redrobScorer.js — AI-Recruit Pro
// Scores candidates against Redrob Senior AI Engineer JD
// ─────────────────────────────────────────────────────────────────

export function scoreCandidate(candidate) {
  const profile = candidate.profile;
  const skills  = candidate.skills || [];
  const signals = candidate.redrob_signals;
  const career  = candidate.career_history || [];

  // ── CONSULTING FIRMS ─────────────────────────────────────────
  const consultingFirms = [
    'tcs', 'infosys', 'wipro', 'accenture', 'cognizant',
    'capgemini', 'hcl', 'tech mahindra', 'mphasis', 'hexaware'
  ];

  const allConsulting = career.length > 0 && career.every(c =>
    consultingFirms.some(cf => c.company.toLowerCase().includes(cf))
  );

  // ── TITLE CHECKS ─────────────────────────────────────────────
  const hardRejectTitles = [
    'accountant', 'graphic designer', 'civil engineer',
    'mechanical engineer', 'hr manager', 'operations manager',
    'marketing manager', 'customer support', 'business analyst',
    'project manager', 'scrum master', 'sales'
  ];

  const softRejectTitles = [
    'qa engineer', 'tester', '.net developer', 'java developer',
    'mobile developer', 'frontend engineer', 'devops engineer'
  ];

  const currentTitle = (
    profile.current_title + ' ' + profile.headline
  ).toLowerCase();

  const isHardReject = hardRejectTitles.some(t => currentTitle.includes(t));
  const isSoftReject = softRejectTitles.some(t => currentTitle.includes(t));

  // ── 1. SKILLS MATCH SCORE (0-100) ────────────────────────────
  const coreSkills = [
    'embedding', 'vector', 'retrieval', 'ranking', 'rerank',
    'nlp', 'python', 'llm', 'fine-tun', 'rag',
    'elasticsearch', 'opensearch', 'pinecone', 'faiss',
    'milvus', 'weaviate', 'qdrant',
    'sentence-transformer', 'bert', 'transformer',
    'pytorch', 'tensorflow', 'hugging',
    'machine learning', 'deep learning',
    'information retrieval', 'recommendation',
    'search ranking', 'hybrid search',
    'lora', 'qlora', 'peft', 'xgboost',
    'learning to rank', 'ndcg', 'mrr',
    'kafka', 'spark', 'airflow', 'data pipeline',
    'feature store', 'mlops', 'a/b test'
  ];

  const wrongDomainSkills = [
    'photoshop', 'illustrator', 'graphic', 'tts',
    'speech recognition', 'robotics', 'computer vision',
    'image classification', 'object detection',
    'autocad', 'solidworks'
  ];

  const profMap = { expert: 1.0, advanced: 0.8, intermediate: 0.5, beginner: 0.2 };

  let skillScore = 0;
  let wrongDomainCount = 0;

  skills.forEach(skill => {
    const name = skill.name.toLowerCase();
    const prof = profMap[skill.proficiency] || 0.3;
    const endorseBonus  = Math.min(skill.endorsements / 50, 0.4);
    const durationBonus = Math.min((skill.duration_months || 0) / 48, 0.3);

    const isCore = coreSkills.some(cs => name.includes(cs) || cs.includes(name));
    if (isCore) {
      skillScore += (20 * prof) + (endorseBonus * 8) + (durationBonus * 6);
    }
    if (wrongDomainSkills.some(wd => name.includes(wd))) wrongDomainCount++;
  });

  // Skill assessment bonus
  const assessments = signals.skill_assessment_scores || {};
  const aiAssessKeys = Object.keys(assessments).filter(k => {
    const key = k.toLowerCase();
    return key.includes('nlp') || key.includes('ml') ||
           key.includes('llm') || key.includes('python') ||
           key.includes('ranking') || key.includes('fine') ||
           key.includes('retrieval') || key.includes('embedding');
  });
  if (aiAssessKeys.length > 0) {
    const avgAI = aiAssessKeys.reduce((s, k) => s + assessments[k], 0) / aiAssessKeys.length;
    skillScore += avgAI * 0.12;
  }

  skillScore = Math.min(Math.round(skillScore), 100);
  if (wrongDomainCount >= 3) skillScore = Math.max(skillScore - 20, 0);

  // ── 2. EXPERIENCE SCORE (0-100) ──────────────────────────────
  const yoe = profile.years_of_experience || 0;
  let expScore;
  if      (yoe >= 5  && yoe <= 9)  expScore = 100;
  else if (yoe >= 4  && yoe <  5)  expScore = 82;
  else if (yoe >  9  && yoe <= 12) expScore = 78;
  else if (yoe >= 3  && yoe <  4)  expScore = 58;
  else if (yoe >  12)              expScore = 62;
  else                              expScore = 25;

  // ── 3. CAREER QUALITY SCORE (0-100) ──────────────────────────
  let careerScore = 0;

  if (!isHardReject) {
    const productRoles = career.filter(c =>
      !consultingFirms.some(cf => c.company.toLowerCase().includes(cf))
    );
    careerScore += Math.min(productRoles.length * 20, 40);

    let aiRoleCount = 0;
    career.forEach(c => {
      const desc = ((c.description || '') + ' ' + (c.title || '')).toLowerCase();
      const hasAI =
        desc.includes('ml') || desc.includes('model') ||
        desc.includes('embedding') || desc.includes('ranking') ||
        desc.includes('recommendation') || desc.includes('retrieval') ||
        desc.includes('nlp') || desc.includes('search') ||
        desc.includes('pipeline') || desc.includes('data engineer') ||
        desc.includes('backend') || desc.includes('distributed') ||
        desc.includes('inference') || desc.includes('training') ||
        desc.includes('feature') || desc.includes('deploy');
      if (hasAI && c.duration_months >= 6) aiRoleCount++;
    });
    careerScore += Math.min(aiRoleCount * 20, 60);
  }

  if (allConsulting) careerScore = Math.round(careerScore * 0.4);
  careerScore = Math.min(careerScore, 100);

  // ── 4. BEHAVIORAL SIGNAL SCORE (0-100) ───────────────────────
  let behaviorScore = 0;

  const daysSinceActive = Math.floor(
    (new Date() - new Date(signals.last_active_date)) / (1000 * 60 * 60 * 24)
  );

  if      (daysSinceActive <= 7)   behaviorScore += 35;
  else if (daysSinceActive <= 14)  behaviorScore += 28;
  else if (daysSinceActive <= 30)  behaviorScore += 20;
  else if (daysSinceActive <= 60)  behaviorScore += 12;
  else if (daysSinceActive <= 90)  behaviorScore += 5;
  else                              behaviorScore += 0;

  if (signals.open_to_work_flag) behaviorScore += 18;
  behaviorScore += Math.round((signals.recruiter_response_rate || 0) * 22);
  behaviorScore += Math.round((signals.interview_completion_rate || 0) * 10);

  if      (signals.notice_period_days <= 15)  behaviorScore += 12;
  else if (signals.notice_period_days <= 30)  behaviorScore += 9;
  else if (signals.notice_period_days <= 60)  behaviorScore += 4;

  behaviorScore += Math.round((signals.profile_completeness_score || 0) * 0.03);
  behaviorScore = Math.min(behaviorScore, 100);

  // ── 5. ASSESSMENT SCORE (0-100) ──────────────────────────────
  const allAssessVals = Object.values(assessments);
  const assessScore = allAssessVals.length > 0
    ? Math.round(allAssessVals.reduce((a, b) => a + b, 0) / allAssessVals.length)
    : 40;

  // ── 6. LOCATION SCORE (0-100) ─────────────────────────────────
  const targetCities = [
    'pune', 'noida', 'delhi', 'gurgaon', 'gurugram',
    'hyderabad', 'mumbai', 'bangalore', 'bengaluru'
  ];
  const locationStr = (profile.location + ' ' + profile.country).toLowerCase();
  let locationScore = 20;

  if (profile.country === 'India' || locationStr.includes('india')) {
    locationScore = targetCities.some(c => locationStr.includes(c)) ? 100 : 65;
  }
  if (!signals.willing_to_relocate && locationScore < 65) {
    locationScore = Math.max(locationScore - 15, 5);
  }

  // ── 7. GITHUB BONUS ───────────────────────────────────────────
  let githubBonus = 0;
  if (signals.github_activity_score > 0) {
    githubBonus = Math.round(signals.github_activity_score * 0.06);
  }

  // ── 8. FINAL WEIGHTED SCORE ───────────────────────────────────
  const effectiveExpScore    = skillScore >= 30 ? expScore    : Math.round(expScore    * 0.25);
  const effectiveCareerScore = skillScore >= 20 ? careerScore : Math.round(careerScore * 0.30);

  let overall = Math.round(
    (skillScore           * 0.35) +
    (effectiveExpScore    * 0.20) +
    (effectiveCareerScore * 0.20) +
    (behaviorScore        * 0.15) +
    (assessScore          * 0.05) +
    (locationScore        * 0.05) +
    githubBonus
  );

  // ── HARD PENALTIES ────────────────────────────────────────────
  if (isHardReject)               overall = Math.min(overall, 22);
  if (isSoftReject)               overall = Math.min(overall, 45);
  if (allConsulting)              overall = Math.round(overall * 0.65);
  if (daysSinceActive > 180)      overall = Math.round(overall * 0.80);
  else if (daysSinceActive > 120) overall = Math.round(overall * 0.90);
  if (profile.country !== 'India') overall = Math.round(overall * 0.87);
  if      (skillScore < 10)       overall = Math.min(overall, 18);
  else if (skillScore < 20)       overall = Math.min(overall, 30);
  else if (skillScore < 30)       overall = Math.min(overall, 48);

  overall = Math.max(0, Math.min(overall, 100));

  // ── RECOMMENDATION ────────────────────────────────────────────
  const recommendation =
    isHardReject  ? 'rejected'    :
    overall >= 52 ? 'shortlisted' :
    overall >= 35 ? 'maybe'       : 'rejected';

  return {
    candidate_id:  candidate.candidate_id,
    name:          profile.anonymized_name,
    headline:      profile.headline,
    location:      profile.location,
    country:       profile.country,
    years_exp:     yoe,
    current_title: profile.current_title,
    scores: {
      skill_match:    skillScore,
      experience:     expScore,
      career_quality: careerScore,
      behavioral:     behaviorScore,
      assessment:     assessScore,
      location:       locationScore,
      github_bonus:   githubBonus,
      overall:        overall
    },
    signals: {
      open_to_work:         signals.open_to_work_flag,
      notice_days:          signals.notice_period_days,
      last_active_days_ago: daysSinceActive,
      github_score:         signals.github_activity_score,
      response_rate:        Math.round(signals.recruiter_response_rate * 100) + '%',
      interview_rate:       Math.round((signals.interview_completion_rate || 0) * 100) + '%',
      salary_min_lpa:       signals.expected_salary_range_inr_lpa?.min,
      salary_max_lpa:       signals.expected_salary_range_inr_lpa?.max,
      willing_to_relocate:  signals.willing_to_relocate,
      work_mode:            signals.preferred_work_mode,
      profile_complete:     signals.profile_completeness_score + '%'
    },
    flags: {
      is_hard_reject: isHardReject,
      is_soft_reject: isSoftReject,
      all_consulting: allConsulting,
      inactive_180d:  daysSinceActive > 180,
      outside_india:  profile.country !== 'India'
    },
    recommendation
  };
}