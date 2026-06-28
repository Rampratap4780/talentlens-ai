import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { scoreCandidate } from './redrobScorer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load hackathon data
const dataPath = path.join(__dirname, '../../dataset/sample_candidates.json');
const candidates = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log(`\nProcessing ${candidates.length} candidates...\n`);

// Score all candidates
const results = candidates.map(scoreCandidate);

// Sort by overall score
results.sort((a, b) => b.scores.overall - a.scores.overall);

// Add rank
results.forEach((r, i) => r.rank = i + 1);

// Print top 10
console.log('=== TOP 10 CANDIDATES ===\n');
results.slice(0, 10).forEach(r => {
  console.log(`${r.rank}. ${r.name} — ${r.scores.overall}/100`);
  console.log(`   ${r.headline}`);
  console.log(`   📍 ${r.location}, ${r.country} | ${r.years_exp} yrs`);
  console.log(`   Skills: ${r.scores.skill_match} | Exp: ${r.scores.experience} | Career: ${r.scores.career_quality} | Behavior: ${r.scores.behavioral}`);
  console.log(`   Status: ${r.recommendation.toUpperCase()} | Notice: ${r.signals.notice_days}d | Active: ${r.signals.last_active_days_ago}d ago`);
  console.log();
});

// Generate CSV (judges ke liye)
const csvHeader = 'rank,candidate_id,name,headline,location,country,years_exp,skill_score,exp_score,career_score,behavioral_score,assessment_score,overall_score,open_to_work,notice_days,last_active_days,github_score,response_rate,salary_min_lpa,salary_max_lpa,recommendation';

const csvRows = results.map(r => [
  r.rank,
  r.candidate_id,
  `"${r.name}"`,
  `"${r.headline}"`,
  `"${r.location}"`,
  r.country,
  r.years_exp,
  r.scores.skill_match,
  r.scores.experience,
  r.scores.career_quality,
  r.scores.behavioral,
  r.scores.assessment,
  r.scores.overall,
  r.signals.open_to_work,
  r.signals.notice_days,
  r.signals.last_active_days_ago,
  r.signals.github_score,
  r.signals.response_rate,
  r.signals.salary_min,
  r.signals.salary_max,
  r.recommendation
].join(','));

const csv = [csvHeader, ...csvRows].join('\n');
const csvPath = path.join(__dirname, '../../dataset/ranked_candidates.csv');
fs.writeFileSync(csvPath, csv);

console.log(`\n✅ CSV saved: dataset/ranked_candidates.csv`);
console.log(`Total: ${results.length} | Shortlisted: ${results.filter(r => r.recommendation === 'shortlisted').length} | Maybe: ${results.filter(r => r.recommendation === 'maybe').length} | Rejected: ${results.filter(r => r.recommendation === 'rejected').length}`);