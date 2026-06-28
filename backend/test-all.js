const dotenv = await import('dotenv');
dotenv.default.config();

const BASE = 'http://localhost:5000';
let jobId, candidateId;

function log(emoji, msg, detail) {
  console.log(emoji + ' ' + msg + (detail ? ' -> ' + detail : ''));
}

console.log('\n=== AI-Recruit Pro Full Test ===\n');

// Test 1: Health
try {
  const res = await fetch(BASE + '/health').then(r => r.json());
  log('✅', 'Server OK', 'DB: ' + res.db);
} catch(e) {
  log('❌', 'Server Down');
  process.exit(1);
}

// Test 2: Create Job
try {
  const res = await fetch(BASE + '/api/jobs/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Full Stack Developer',
      company: 'TechCorp India',
      description: 'React Node.js MongoDB developer needed for scalable apps',
      required_skills: ['React', 'Node.js', 'MongoDB'],
      experience_required: 3
    })
  }).then(r => r.json());
  jobId = res.job?.id;
  log(res.success ? '✅' : '❌', 'Job Create', res.success ? 'ID: ' + jobId : res.message);
} catch(e) {
  log('❌', 'Job Error', e.message);
}

// Test 3: Upload Resume (unique email har baar)
try {
  const uniqueEmail = `testuser${Date.now()}@example.com`;
  const res = await fetch(BASE + '/api/candidates/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resume_text: `
        Name: Arjun Mehta
        Email: ${uniqueEmail}
        Phone: +91-9876543210
        Location: Delhi, India
        GitHub: arjun-dev

        SUMMARY:
        Full Stack Developer with 3 years of experience building scalable web applications.

        SKILLS:
        Languages: JavaScript, TypeScript, Python
        Frameworks: React, Node.js, Express
        Databases: MongoDB, PostgreSQL
        Tools: Docker, Git, AWS

        EXPERIENCE:
        Built fintech dashboard for 20,000 users with 99.9% uptime.
        Developed REST APIs serving 500 requests per second.

        EDUCATION:
        B.Tech Computer Science, Delhi University, 2021
      `,
      job_id: jobId
    })
  }).then(r => r.json());
  candidateId = res.candidate?.id;
  log(res.success ? '✅' : '❌', 'Resume Upload', res.success ? 'Name: ' + res.candidate?.name : res.message);
} catch(e) {
  log('❌', 'Resume Error', e.message);
}

// Test 4: GitHub API
try {
  const res = await fetch(BASE + '/api/github/torvalds').then(r => r.json());
  log(res.success ? '✅' : '❌', 'GitHub API', res.success ? 'Repos: ' + res.github?.total_repos : res.message);
} catch(e) {
  log('❌', 'GitHub Error', e.message);
}

// Test 5: Micro Test
try {
  const res = await fetch(BASE + '/api/test/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidate_id: candidateId })
  }).then(r => r.json());
  log(res.success ? '✅' : '❌', 'Test Generate', res.success ? 'Lang: ' + res.test?.language : res.message);
} catch(e) {
  log('❌', 'Test Error', e.message);
}

// Test 6: Dashboard
try {
  const res = await fetch(BASE + '/api/dashboard/stats').then(r => r.json());
  log(res.success ? '✅' : '❌', 'Dashboard', res.success ? 'Total: ' + res.stats?.total_candidates : res.message);
} catch(e) {
  log('❌', 'Dashboard Error', e.message);
}

// Test 7: Vector Search
try {
  const res = await fetch(BASE + `/api/candidates/search?jobId=${jobId}&limit=3`).then(r => r.json());
  log(res.success ? '✅' : '❌', 'Vector Search', res.success ? 'Found: ' + res.count + ' candidates' : res.message);
  if (res.success) {
    res.candidates?.forEach((c, i) => {
      console.log(`     ${i+1}. ${c.name} — ${c.final_scores?.semantic_match_score}%`);
    });
  }
} catch(e) {
  log('❌', 'Search Error', e.message);
}

// Test 8: CSV Export
try {
  const res = await fetch(BASE + '/api/dashboard/export');
  log(res.ok ? '✅' : '❌', 'CSV Export', 'Status: ' + res.status);
} catch(e) {
  log('❌', 'CSV Error', e.message);
}

console.log('\n=== Test Done ===\n');
console.log('Day 1 ✅ Backend + MongoDB + Gemini AI');
console.log('Day 2 ✅ Vector Search + Semantic Matching');
console.log('Day 3 → GitHub Verification + Scoring');