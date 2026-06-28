const dotenv = await import('dotenv');
dotenv.default.config();

const BASE = 'http://localhost:5000';

console.log('\n=== Vector Search Test ===\n');

const testQueries = [
  'someone who builds things that dont break under load',
  'frontend developer with design skills',
  'machine learning and python experience',
  'junior backend developer REST APIs'
];

for (const query of testQueries) {
  console.log('🔍 Query:', query);

  // Is query se job banao
  const jobRes = await fetch(BASE + '/api/jobs/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Search Test',
      company: 'Test Co',
      description: query,
      required_skills: [],
      experience_required: 0
    })
  }).then(r => r.json());

  if (!jobRes.success) {
    console.log('❌ Failed:', jobRes.message, '\n');
    continue;
  }

  // Search karo
  const searchRes = await fetch(
    `${BASE}/api/candidates/search?jobId=${jobRes.job.id}&limit=3`
  ).then(r => r.json());

  if (searchRes.success && searchRes.candidates.length > 0) {
    console.log('Top matches:');
    searchRes.candidates.forEach((c, i) => {
      console.log(`  ${i+1}. ${c.name} — ${c.final_scores?.semantic_match_score}%`);
    });
  } else {
    console.log('❌ Search failed:', searchRes.message);
  }

  console.log();
  await new Promise(r => setTimeout(r, 3000));
}

console.log('=== Done ===\n');