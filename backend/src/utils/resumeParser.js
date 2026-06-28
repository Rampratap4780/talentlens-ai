import { generateJSON } from './geminiClient.js';

export async function parseResume(resumeText) {
  const prompt = `
You are an expert resume parser. Analyze this resume and extract structured data.

RESUME TEXT:
${resumeText}

Return ONLY a valid JSON object with this exact structure (no extra text, no markdown):
{
  "name": "Full name",
  "email": "email address",
  "phone": "phone number or null",
  "location": "city, country or null",
  "github_username": "github username without @ or URL, just username, or null",
  "linkedin_url": "full linkedin URL or null",
  "parsed_skills": {
    "languages": ["JavaScript", "Python"],
    "frameworks": ["React", "Node.js"],
    "tools": ["Docker", "Git", "AWS"],
    "domains": ["Backend Development", "Machine Learning"],
    "years_experience": 3,
    "top_skill": "JavaScript"
  },
  "skill_radar": {
    "claimed": {
      "JavaScript": 9,
      "Python": 7,
      "React": 8
    }
  },
  "career_summary": "2-sentence summary of career"
}

Rules:
- years_experience: calculate from dates mentioned, not what they claim
- claimed skills: rate each skill 1-10 based on how confidently they describe it
- top_skill: the single skill they show most evidence of
- Only include skills actually mentioned in the resume
`;

  const parsed = await generateJSON(prompt);
  return parsed;
}