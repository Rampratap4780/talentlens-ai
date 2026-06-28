import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { scoreCandidate } from './redrobScorer.js';
import Candidate from '../models/Candidate.js';
import Job from '../models/Job.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function generateEmbedding(text) {
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected\n');

  // Load dataset
  const dataPath = path.join(__dirname, '../../dataset/sample_candidates.json');
  const candidates = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  // Find or create job
  let job = await Job.findOne({ title: 'Senior AI Engineer' });
  if (!job) {
    console.log('Creating job...');
    const jobText = 'Senior AI Engineer with expertise in embeddings, vector search, retrieval ranking, NLP, LLMs, RAG, fine-tuning, PyTorch, Elasticsearch, recommendation systems';
    const jobVector = await generateEmbedding(jobText);
    job = await Job.create({
      title: 'Senior AI Engineer',
      company: 'Redrob',
      description: jobText,
      required_skills: ['Python', 'NLP', 'LLM', 'Embeddings', 'Vector Search'],
      experience_required: 5,
      description_vector: jobVector
    });
    console.log('✅ Job created:', job._id);
  } else {
    console.log('✅ Job exists:', job._id);
  }

  console.log(`\nImporting ${candidates.length} candidates...\n`);

  let imported = 0;
  let skipped  = 0;

  for (const raw of candidates) {
    const profile = raw.profile;
    const email   = `${raw.candidate_id.toLowerCase()}@redrob.ai`;

    // Skip if exists
    const exists = await Candidate.findOne({ email });
    if (exists) {
      process.stdout.write(`⏭️  Skip: ${profile.anonymized_name}\n`);
      skipped++;
      continue;
    }

    process.stdout.write(`Importing ${profile.anonymized_name}...`);

    // Score using our algorithm
    const scored = scoreCandidate(raw);

    // Build resume text for embedding
    const resumeText = `
      ${profile.anonymized_name}. ${profile.headline}.
      ${profile.summary}
      Location: ${profile.location}, ${profile.country}.
      Experience: ${profile.years_of_experience} years.
      Current: ${profile.current_title} at ${profile.current_company}.
      Skills: ${raw.skills.map(s => s.name).join(', ')}.
    `.trim();

    // Generate embedding
    await sleep(2000);
    let vector = [];
    try {
      vector = await generateEmbedding(resumeText);
    } catch (e) {
      console.log(' (embedding failed, continuing)');
    }

    // Build skill radar
    const claimedSkills = {};
    raw.skills.slice(0, 8).forEach(s => {
      const profMap = { expert: 9, advanced: 7, intermediate: 5, beginner: 3 };
      claimedSkills[s.name] = profMap[s.proficiency] || 5;
    });

    // Create candidate
    await Candidate.create({
      name:            profile.anonymized_name,
      email:           email,
      location:        profile.location,
      resume_text:     resumeText,
      resume_vector:   vector,
      parsed_skills: {
        languages:        raw.skills.filter(s => ['Python','JavaScript','Java','C++','Go','Rust','TypeScript','SQL','Scala','R'].includes(s.name)).map(s => s.name),
        frameworks:       raw.skills.filter(s => ['PyTorch','TensorFlow','React','Node.js','FastAPI','Django','Spring'].includes(s.name)).map(s => s.name),
        tools:            raw.skills.slice(0, 5).map(s => s.name),
        domains:          [profile.current_industry || 'Technology'],
        years_experience: profile.years_of_experience,
        top_skill:        raw.skills[0]?.name || 'Python'
      },
      skill_radar: {
        claimed:  claimedSkills,
        verified: {}
      },
      applied_job_id: job._id,
      final_scores: {
        semantic_match_score: 0,
        github_trust_score:   Math.round(raw.redrob_signals.github_activity_score > 0 ? raw.redrob_signals.github_activity_score : 0),
        micro_test_score:     0,
        experience_score:     scored.scores.experience,
        activity_score:       scored.scores.behavioral,
        overall_rank_score:   scored.scores.overall
      },
      status: scored.recommendation === 'shortlisted' ? 'shortlisted' :
              scored.recommendation === 'maybe'       ? 'screening'   : 'applied'
    });

    imported++;
    console.log(` ✅ Score: ${scored.scores.overall} — ${scored.recommendation}`);
    await sleep(500);
  }

  console.log(`\n✅ Done! Imported: ${imported} | Skipped: ${skipped}`);
  console.log('Total candidates:', await Candidate.countDocuments());
  process.exit(0);
}

main().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});