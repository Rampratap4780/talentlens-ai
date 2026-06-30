# TalentLens AI 🎯
### Intelligent Candidate Discovery & Ranking System
**India Runs Hackathon 2026 — Track 01: Data & AI Challenge**

> **Transparency Note:** This project was built with significant
> assistance from Claude AI (Anthropic) for code generation,
> architecture design, and problem solving. All logic, decisions,
> and implementations were directed and verified by the developer.
> Use of AI tools is standard practice in 2026 and aligns with
> the hackathon's spirit of building with best available tools.

---

## 🎯 Problem Statement

Recruiters go through hundreds of profiles and still miss the
right person — not because talent isn't there, but because
keyword filters can't see what actually matters.

**TalentLens AI** ranks candidates the way a great recruiter
would — not by matching keywords, but by actually understanding
who fits the role.

---

## ✨ Key Features

### 1. 🧠 Deep Semantic Matching
- Resumes + JD converted to 768-dim vectors
- Gemini text-embedding-001 model
- Cosine similarity finds meaning not keywords

### 2. 📊 Multi-Signal Scoring (6 Dimensions)
```
Semantic Match      35% — Vector similarity
Experience Quality  20% — Years + trajectory
Career Quality      20% — Product vs consulting
Behavioral Signals  15% — Platform activity
Skill Assessment     5% — Test scores
Location Match       5% — Pune/Noida preferred
```

### 3. 🔴 Behavioral Signal Integration
8 real Redrob platform signals: last active date,
recruiter response rate, interview completion rate,
open to work flag, GitHub activity score, notice
period days, profile completeness, offer acceptance rate

### 4. 🤖 AI Explainability
"Why This Candidate?" + Head-to-Head AI comparison

### 5. ⚡ Smart JD Analyzer
Paste any JD → AI extracts requirements + matches candidates

### 6. 🛡️ Live Skill Verification
60-second Fix-the-Bug coding test with anti-cheat system

### 7. 🚨 Smart Disqualification Engine
```
Hard Reject:    Accountant, Graphic Designer → cap 22
Soft Reject:    QA Engineer, .NET Dev        → cap 45
Consulting:     All consulting career        → x0.65
Inactive:       180+ days                   → x0.80
Outside India:                              → x0.87
```

### 8. 👥 Dual Portal System
HR Portal (Dashboard, JD Analyzer, Compare, Export) +
Candidate Portal (Jobs, Resume Upload, Skill Test, Profile)

---

## 📖 How to Use Each Feature

### 🏢 For HR / Recruiters

**A. Login to HR Portal**
```
1. Go to /login?role=admin
2. Email:    admin@talentlens.ai
3. Password: admin123
4. Click "Sign In as HR Admin"
→ Redirects to HR Dashboard
```

**B. View Ranked Candidates Dashboard**
```
1. Go to /hr (or click "Dashboard" in navbar)
2. See stats cards: Total, Shortlisted, Tests, Avg Score
3. Browse ranked candidate list (sorted by overall score)
4. Click any candidate to see full details on right panel
```

**C. Use "Why This Candidate?" AI Explainer**
```
1. Click on any candidate in the list
2. Click "🤖 Why This Candidate?" button
3. Wait 2-3 seconds for AI analysis
4. Read natural language explanation:
   - Verdict (Strong Fit / Possible Fit / Not a Fit)
   - Top reasons for/against
   - Hiring recommendation
```

**D. Compare Two Candidates Head-to-Head**
```
1. Click "+ Compare" on first candidate
2. Click "+ Compare" on second candidate
3. Blue bar appears at top showing both selected
4. Click "⚡ Compare with AI"
5. See: Winner, Strengths, Weaknesses,
   Final Recommendation
```

**E. Analyze a Job Description**
```
1. Go to /hr/jd (click "JD Analyzer" in navbar)
2. Paste any job description in the text box
   (or click "Use Sample JD" to test)
3. Click "🔍 Find Best Candidates"
4. AI shows:
   - Parsed JD (skills, experience, location)
   - Top 10 matching candidates ranked by
     semantic similarity %
```

**F. Update Candidate Status**
```
1. Select a candidate from dashboard
2. Use the dropdown at bottom of detail panel
3. Choose: Applied / Screening / Shortlisted /
   Rejected / Hired
4. Status updates immediately in database
```

**G. Export Ranked Results**
```
1. Click "📥 Export CSV" button (top right of dashboard)
2. CSV downloads automatically with all candidates,
   all scores, and recommendations
3. This is your judge submission file
```

---

### 🧑‍💻 For Candidates

**A. Browse Open Jobs**
```
1. Go to / (homepage)
2. Click "Candidate Portal" card
3. Browse list of open positions
4. See: title, company, location,
   required skills, experience needed
```

**B. Apply to a Job**
```
1. On Jobs page, click "Apply Now →" on any job
2. Redirects to /candidate with Job ID auto-filled
3. Continue to resume upload (see below)
```

**C. Upload Resume (Two Ways)**

*Option 1 — Upload PDF:*
```
1. Go to /candidate
2. Click "📄 Upload PDF" tab
3. Drag and drop your PDF, or click to browse
4. Enter your Email (required for login later)
5. Enter GitHub username (optional, for verification)
6. Click "Analyze PDF with AI →"
7. Wait 5-8 seconds for AI processing
```

*Option 2 — Paste Text:*
```
1. Go to /candidate
2. Click "✏️ Paste Text" tab
3. Paste your resume text in the box
4. Enter your Email
5. Click "Analyze Resume with AI →"
```

**D. View Your Results**
```
After upload, you instantly see:
- Your parsed name, email
- Top skill detected
- Years of experience calculated
- Skills detected (tags)
- "Take Skill Test →" button
```

**E. Take the 60-Second Skill Test**
```
1. Click "Take Skill Test →" after upload
   (or go to /test)
2. Read the test rules carefully:
   - 60 seconds only
   - Find and fix the bug
   - Tab switching is detected and penalized
   - Refreshing increases difficulty
3. Click "Start Test →"
4. AI generates a unique buggy code snippet
   in your strongest programming language
5. Read the code, find the bug
6. Type your fix or explanation in the text box
7. Submit before timer hits 0
8. See your score + AI feedback instantly
```

**F. Login to Check Your Profile**
```
1. Go to /login?role=candidate
2. Enter the SAME email used during resume upload
3. Click "Sign In as Candidate"
4. View your Profile page:
   - Application status (Applied/Shortlisted/etc)
   - Overall Skill Trust Score
   - Score breakdown (Semantic, GitHub, Test, etc)
   - Skill Radar Chart (Claimed vs Verified)
   - Test completion status
```

---

## 🔄 Complete End-to-End Flow

```
HR Side:
  1. Login as Admin
  2. Paste JD in JD Analyzer
  3. AI extracts requirements + finds matches
  4. Click candidate → Get AI explanation
  5. Compare top 2 candidates
  6. Update status to "Shortlisted"
  7. Export CSV for records

Candidate Side:
  1. Browse Jobs page
  2. Click Apply Now on a job
  3. Upload resume (PDF or text)
  4. AI parses skills automatically
  5. Take 60-second skill test
  6. Login later to check status/score
```

---

## 📊 Results — Hackathon Dataset

**50 candidates processed for Senior AI Engineer @ Redrob**

| Rank | Candidate | Score | Skill | Exp | Behavior | Status |
|------|-----------|-------|-------|-----|----------|--------|
| 1 | Ela Singh | 96/100 | 100 | 100 | 71 | ✅ Shortlisted |
| 2 | Aarav Sen | 70/100 | 90 | 100 | 10 | ✅ Shortlisted |
| 3 | Ira Vora | 59/100 | 60 | 100 | 51 | ✅ Shortlisted |
| 4 | Atharv Joshi | 45/100 | 42 | 100 | 31 | 🟡 Maybe |
| 5 | Anika Kumar | 45/100 | 25 | 100 | 48 | 🟡 Maybe |
| ... | ... | ... | ... | ... | ... | ... |
| 50 | Wrong Domain | 12/100 | 5 | 25 | 41 | ❌ Rejected |

**Total: 50 | Shortlisted: 3 | Maybe: 8 | Rejected: 39**

---

## 🛠️ Tech Stack (100% Free — ₹0/month)

| Component | Technology | Cost |
|-----------|------------|------|
| AI Model | Gemini 2.5 Flash | ₹0 Free |
| Embeddings | Gemini embedding-001 | ₹0 Free |
| Database | MongoDB Atlas M0 | ₹0 Free |
| Backend | Node.js + Express | ₹0 Open Source |
| Frontend | React + Vite + Tailwind | ₹0 Open Source |
| Charts | Recharts | ₹0 Open Source |
| PDF Parse | pdf-parse | ₹0 Open Source |
| Verification | GitHub REST API | ₹0 Free |
| Deploy Frontend | Vercel | ₹0 Free Tier |
| Deploy Backend | Render | ₹0 Free Tier |
| **Total** | | **₹0/month** |

---

## ⚙️ Environment Variables

### Backend `.env` File Structure

Create `backend/.env` file:

```env
# --- Google Gemini AI (FREE) ---
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# --- MongoDB Atlas (FREE) ---
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/talentlens_ai

# --- Server Config ---
PORT=5000
FRONTEND_URL=http://localhost:5173

# --- Admin Login ---
ADMIN_EMAIL=admin@talentlens.ai
ADMIN_PASSWORD=admin123

# --- AI Models ---
GEMINI_MODEL=gemini-2.5-flash
EMBEDDING_MODEL=gemini-embedding-001

# --- GitHub API (Optional) ---
GITHUB_TOKEN=optional_github_personal_access_token
```

### How to Get Each Key

```
GEMINI_API_KEY:
  1. Go to https://aistudio.google.com
  2. Sign in with Google account
  3. Click "Get API Key" → "Create API Key"
  4. Copy and paste into .env

MONGODB_URI:
  1. Go to https://www.mongodb.com/atlas
  2. Create free account → M0 cluster
  3. Click "Connect" → "Drivers"
  4. Copy connection string
  5. Replace <password> with your password
  6. Replace myFirstDatabase with talentlens_ai
  7. Add 0.0.0.0/0 to Network Access
```

---

## 🚀 Complete Setup Guide

### Prerequisites
```
Node.js 20+    → https://nodejs.org
Git            → https://git-scm.com
MongoDB Atlas  → free account
Gemini API Key → free key
```

### Step 1 — Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/talentlens-ai.git
cd talentlens-ai
```

### Step 2 — Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in GEMINI_API_KEY and MONGODB_URI
```

### Step 3 — Start Backend Server
```bash
npm run dev
# ✅ MongoDB Atlas connected
# 🚀 Server running → http://localhost:5000
```

### Step 4 — Frontend Setup (new terminal)
```bash
cd frontend
npm install
```

### Step 5 — Start Frontend
```bash
npm run dev
# Local: http://localhost:5173
```

### Step 6 — Load Hackathon Dataset
```bash
cd backend
node src/utils/processHackathonData.js
node src/utils/importHackathonCandidates.js
```

### Step 7 — Login and Explore
```
HR Admin:    /login?role=admin
             admin@talentlens.ai / admin123

Candidate:   /login?role=candidate
             use email from resume upload
```

---

## 📋 Quick Start (All Commands)

```bash
git clone https://github.com/YOUR_USERNAME/talentlens-ai.git
cd talentlens-ai

cd backend
npm install
cp .env.example .env
npm run dev

# new terminal
cd frontend
npm install
npm run dev

# new terminal
cd backend
node src/utils/importHackathonCandidates.js

# open http://localhost:5173
```

---

## 📁 Project Structure

```
talentlens-ai/
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── models/
│   │   │   ├── Candidate.js
│   │   │   └── Job.js
│   │   ├── routes/
│   │   │   ├── candidates.js
│   │   │   ├── jobs.js
│   │   │   ├── explain.js
│   │   │   ├── jdparser.js
│   │   │   ├── test.js
│   │   │   ├── github.js
│   │   │   ├── dashboard.js
│   │   │   └── auth.js
│   │   └── utils/
│   │       ├── geminiClient.js
│   │       ├── resumeParser.js
│   │       ├── redrobScorer.js
│   │       ├── scoreCalculator.js
│   │       ├── processHackathonData.js
│   │       └── importHackathonCandidates.js
│   ├── dataset/
│   │   ├── sample_candidates.json
│   │   └── ranked_candidates.csv
│   ├── .env.example
│   └── package.json
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Landing.jsx
│       │   ├── Login.jsx
│       │   ├── Dashboard.jsx
│       │   ├── JDParser.jsx
│       │   ├── Jobs.jsx
│       │   ├── CandidatePortal.jsx
│       │   ├── CandidateProfile.jsx
│       │   └── TestArena.jsx
│       └── utils/
│           ├── api.js
│           └── auth.js
└── README.md
```

---

## 🔧 Troubleshooting

```
MongoDB connection failed
→ Check MONGODB_URI in .env
→ Atlas → Network Access → Add 0.0.0.0/0

Gemini API error 404
→ Check GEMINI_API_KEY in .env
→ Verify key at aistudio.google.com

npm install fails
→ node --version must show v20+

Port 5000 in use
→ Change PORT=5001 in .env

Frontend blank page
→ Start backend first
→ Check browser console

Embedding fails
→ Wait 1 minute (rate limit)
→ Free tier: 1500 req/day
```

---

## 📤 Submission Files

| File | Description |
|------|-------------|
| `dataset/ranked_candidates.csv` | Ranked output — all 50 candidates |
| `README.md` | This documentation |
| GitHub Repo | Complete source code |
| PDF Deck | Architecture + methodology slides |

---

## 🤖 AI Tools Used

| Tool | Purpose |
|------|---------|
| **Claude AI (Anthropic)** | Code generation, architecture, debugging |
| **Gemini 2.5 Flash** | Resume parsing, explanations, test generation |
| **Gemini embedding-001** | Semantic vector embeddings |

### Transparency Statement

> This project was built with Claude AI as a coding assistant —
> similar to how developers use GitHub Copilot or ChatGPT.
> All architectural decisions, business logic, scoring algorithms,
> and final implementations were directed, reviewed, and verified
> by the developer. The multi-signal scoring approach, behavioral
> signal integration, smart disqualification engine, and
> explainability features represent original problem-solving and
> domain understanding. Claude helped write the code — the
> developer designed the solution.

---

## 📜 License

MIT License — Free to use, modify, distribute.

---

## 👨‍💻 Built For

**India Runs Hackathon 2026**
Track 01 — Data & AI Challenge
Organized by Redrob & Hack2skill

*"Build what next India runs on"*
