import { generateJSON, sleep } from './geminiClient.js';

const GITHUB_HEADERS = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'AI-Recruit-Pro',
  ...(process.env.GITHUB_TOKEN && {
    'Authorization': `token ${process.env.GITHUB_TOKEN}`
  })
};

// ─── Fetch GitHub Profile + Repos ────────────────────────────────
export async function fetchGitHubData(username) {
  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, { headers: GITHUB_HEADERS }),
    fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers: GITHUB_HEADERS })
  ]);

  if (!userRes.ok) {
    throw new Error(`GitHub user not found: ${username}`);
  }

  const user  = await userRes.json();
  const repos = reposRes.ok ? await reposRes.json() : [];

  // Language count across all repos
  const langCount = {};
  repos.forEach(repo => {
    if (repo.language) {
      langCount[repo.language] = (langCount[repo.language] || 0) + 1;
    }
  });

  const totalRepos  = Object.values(langCount).reduce((a, b) => a + b, 0) || 1;
  const top_languages = Object.entries(langCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([language, count]) => ({
      language,
      percentage: Math.round((count / totalRepos) * 100)
    }));

  const totalStars  = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  const accountAge  = new Date().getFullYear() - new Date(user.created_at).getFullYear();
  const hasReadme   = repos.filter(r => !r.fork && r.description).length;
  const ownRepos    = repos.filter(r => !r.fork).length;

  return {
    top_languages,
    total_repos:       user.public_repos || 0,
    own_repos:         ownRepos,
    total_stars:       totalStars,
    account_age_years: accountAge,
    followers:         user.followers || 0,
    has_readme_repos:  hasReadme,
    bio:               user.bio || ''
  };
}

// ─── Calculate Activity Score (0-100) ────────────────────────────
export function calculateActivityScore(githubData) {
  if (!githubData || !githubData.verified) return 0;

  let score = 0;

  // Account age (max 20 pts)
  score += Math.min(githubData.account_age_years * 4, 20);

  // Own repos count (max 25 pts)
  score += Math.min((githubData.own_repos || githubData.total_repos) * 2, 25);

  // Stars earned (max 25 pts)
  score += Math.min(githubData.total_stars * 0.5, 25);

  // Language diversity (max 15 pts)
  score += Math.min((githubData.top_languages?.length || 0) * 3, 15);

  // Has documented repos (max 15 pts)
  score += Math.min((githubData.has_readme_repos || 0) * 2, 15);

  return Math.min(Math.round(score), 100);
}

// ─── Verify GitHub vs Resume Claims ──────────────────────────────
export async function verifyGitHubVsResume(githubData, parsedSkills) {
  await sleep(1000);

  const prompt = `
You are a technical recruiter verifying a developer's resume claims against their actual GitHub data.

RESUME CLAIMED SKILLS:
Languages: ${(parsedSkills.languages || []).join(', ')}
Frameworks: ${(parsedSkills.frameworks || []).join(', ')}
Years of Experience: ${parsedSkills.years_experience || 0}

ACTUAL GITHUB DATA:
Top languages used: ${JSON.stringify(githubData.top_languages)}
Total public repos: ${githubData.total_repos}
Stars earned: ${githubData.total_stars}
Account age: ${githubData.account_age_years} years
Followers: ${githubData.followers}

Calculate a GitHub Trust Score and identify any discrepancies.
Return ONLY valid JSON, no extra text:
{
  "trust_score": 75,
  "verified_skills": {
    "JavaScript": 8,
    "Python": 5,
    "React": 4
  },
  "discrepancies": [
    {
      "skill": "React",
      "claimed_level": 9,
      "actual_evidence": "Not found in top GitHub languages",
      "severity": "high"
    }
  ],
  "positive_signals": [
    "Active GitHub account with consistent commits",
    "Multiple starred repositories"
  ],
  "summary": "One sentence summary"
}

Scoring rules:
- 80-100: GitHub strongly confirms resume claims
- 60-79: Mostly matches with minor gaps  
- 40-59: Some claims not backed by GitHub data
- 20-39: Significant discrepancies found
- 0-19: Resume claims not supported by GitHub
`;

  return await generateJSON(prompt);
}