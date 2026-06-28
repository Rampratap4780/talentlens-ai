const dotenv = await import('dotenv');
dotenv.default.config();

const BASE = 'http://localhost:5000';

console.log('\n=== Day 3: Verify All Candidates ===\n');

const shortlist = await fetch(BASE + '/api/dashboard/shortlist?limit=20').then(r => r.json());
const withGithub = shortlist.candidates.filter(c => c.github_username);

console.log(`Verifying ${withGithub.length} candidates...\n`);

for (const candidate of withGithub) {
  process.stdout.write(`Verifying ${candidate.name} (@${candidate.github_username})... `);

  try {
    const res = await fetch(`${BASE}/api/github/${candidate._id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).then(r => r.json());

    if (res.success) {
      const langs = res.github_data.top_languages?.map(l => l.language).join(', ') || 'none';
      console.log(`✅`);
      console.log(`   Trust: ${res.scores.github_trust_score}/100 | Activity: ${res.scores.activity_score}/100 | Overall: ${res.scores.overall_score}/100`);
      console.log(`   GitHub langs: ${langs}`);
      if (res.verification.discrepancies?.length > 0) {
        console.log(`   ⚠️  ${res.verification.discrepancies.length} discrepancies found`);
      }
    } else {
      console.log(`❌ ${res.message}`);
    }
  } catch(e) {
    console.log(`❌ ${e.message}`);
  }

  console.log();
  // Rate limit ke liye wait
  await new Promise(r => setTimeout(r, 3000));
}

// Final Rankings
console.log('\n=== Final Rankings After GitHub Verification ===\n');
const updated = await fetch(BASE + '/api/dashboard/shortlist?limit=20').then(r => r.json());
updated.candidates
  .sort((a, b) => b.final_scores.overall_rank_score - a.final_scores.overall_rank_score)
  .forEach((c, i) => {
    const scores = c.final_scores;
    console.log(`${i+1}. ${c.name}`);
    console.log(`   Overall: ${scores.overall_rank_score} | Semantic: ${scores.semantic_match_score} | GitHub: ${scores.github_trust_score} | Activity: ${scores.activity_score}`);
  });

console.log('\n=== Day 3 Complete ===');
console.log('Day 1 ✅  Backend + MongoDB + Gemini AI');
console.log('Day 2 ✅  Vector Search + Semantic Matching');
console.log('Day 3 ✅  GitHub Verification + Trust Scores');
console.log('Day 4 →   Anti-Cheat Micro Test');