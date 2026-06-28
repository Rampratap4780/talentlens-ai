import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Candidate from '../models/Candidate.js';
import Job from '../models/Job.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateEmbedding(text) {
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const resumes = [
  {
    name: 'Rahul Sharma',
    email: 'rahul@test.com',
    github_username: 'rahul-dev',
    location: 'Bangalore',
    text: `Rahul Sharma, rahul@test.com, Bangalore.
    Senior Full Stack Developer, 5 years experience.
    Expert in React, Node.js, JavaScript, MongoDB, Docker, AWS.
    Built e-commerce platform with 100k daily users.
    Led team of 8 engineers. Strong system design skills.`
  },
  {
    name: 'Priya Patel',
    email: 'priya@test.com',
    github_username: 'priya-codes',
    location: 'Mumbai',
    text: `Priya Patel, priya@test.com, Mumbai.
    Full Stack Developer, 3 years experience.
    Skills: React, Vue.js, Node.js, PostgreSQL, Python.
    Built fintech dashboard for 50k users.
    Strong in UI/UX and frontend performance optimization.`
  },
  {
    name: 'Amit Kumar',
    email: 'amit@test.com',
    github_username: 'amit-ml',
    location: 'Hyderabad',
    text: `Amit Kumar, amit@test.com, Hyderabad.
    ML Engineer and Backend Developer, 4 years experience.
    Skills: Python, FastAPI, TensorFlow, MongoDB, React.
    Built recommendation engine for 1M users.
    Experience with NLP, computer vision, and data pipelines.`
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha@test.com',
    github_username: 'sneha-dev',
    location: 'Pune',
    text: `Sneha Reddy, sneha@test.com, Pune.
    Backend Developer, 2 years experience.
    Skills: Node.js, Express, MongoDB, Redis, Docker.
    Built REST APIs for mobile apps with 10k users.
    Good understanding of microservices and CI/CD pipelines.`
  },
  {
    name: 'Vikram Singh',
    email: 'vikram@test.com',
    github_username: 'vikram-fullstack',
    location: 'Delhi',
    text: `Vikram Singh, vikram@test.com, Delhi.
    Senior Developer, 6 years experience.
    Expert: React, Angular, Node.js, GraphQL, PostgreSQL, AWS.
    Architected SaaS platform serving 500k users.
    Strong in cloud infrastructure and DevOps practices.`
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // Create or find job
    let job = await Job.findOne({ title: 'Senior Full Stack Developer' });
    if (!job) {
      console.log('Creating job...');
      const jobText = 'Senior Full Stack Developer needed with React Node.js MongoDB skills for scalable web applications';
      const jobVector = await generateEmbedding(jobText);
      job = await Job.create({
        title: 'Senior Full Stack Developer',
        company: 'TechCorp India',
        description: jobText,
        required_skills: ['React', 'Node.js', 'MongoDB'],
        experience_required: 3,
        description_vector: jobVector
      });
      console.log('✅ Job created:', job._id);
    } else {
      console.log('✅ Job exists:', job._id);
    }

    console.log('\nSeeding candidates...\n');

    for (const resume of resumes) {
      // Check if already exists
      const exists = await Candidate.findOne({ email: resume.email });
      if (exists) {
        console.log(`⏭️  Skip: ${resume.name} (already exists)`);
        continue;
      }

      process.stdout.write(`Processing ${resume.name}...`);

      // Generate embedding
      await sleep(2000);
      const vector = await generateEmbedding(resume.text);

      // Parse with Gemini
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const parseResult = await model.generateContent(`
        Extract info from this resume and return ONLY JSON:
        {
          "parsed_skills": {
            "languages": ["JS"],
            "frameworks": ["React"],
            "tools": ["Docker"],
            "domains": ["Backend"],
            "years_experience": 3,
            "top_skill": "JavaScript"
          },
          "skill_radar": {
            "claimed": { "JavaScript": 9, "React": 8 }
          }
        }
        Resume: ${resume.text}
      `);

      let parsed = { parsed_skills: {}, skill_radar: { claimed: {} } };
      try {
        const raw = parseResult.response.text()
          .replace(/```json\n?/gi, '')
          .replace(/```\n?/gi, '')
          .trim();
        parsed = JSON.parse(raw);
      } catch (e) {
        console.log(' (parse warning)');
      }

      await sleep(1000);

      await Candidate.create({
  name:            resume.name,
  email:           resume.email,
  github_username: resume.github_username,
  location:        resume.location,
  resume_text:     resume.text,
  resume_vector:   vector,
  parsed_skills:   parsed.parsed_skills || {},
  skill_radar: {
    claimed:  parsed.skill_radar?.claimed || {},
    verified: {}
  },
  applied_job_id: job._id,
  final_scores: {
    semantic_match_score: Math.floor(Math.random() * 20) + 70, // 70-90 range
    experience_score:     Math.floor(Math.random() * 20) + 65, // 65-85 range
    overall_rank_score:   0
  }
});
      console.log(' ✅ Done');
    }

    console.log('\n✅ Seed complete!');
    console.log('Total candidates:', await Candidate.countDocuments());
    process.exit(0);

  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

seed();