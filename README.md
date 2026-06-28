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
<!-- 
## 🚀 Live Demo

- **Frontend:** https://talentlens-ai.vercel.app
- **Backend API:** https://talentlens-api.render.com
- **Health Check:** https://talentlens-api.render.com/health -->

---

## ✨ Key Features

### 1. 🧠 Deep Semantic Matching
- Resumes + JD converted to 768-dim vectors
- Gemini text-embedding-001 model
- Cosine similarity finds meaning not keywords
- "engineer who builds scalable systems" finds
  "designed distributed architecture for 10M users"

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
8 real Redrob platform signals used:
- Last active date (inactive 180d+ = penalized)
- Recruiter response rate
- Interview completion rate
- Open to work flag
- GitHub activity score
- Notice period days
- Profile completeness
- Offer acceptance rate

### 4. 🤖 AI Explainability
- "Why This Candidate?" natural language explanation
- Head-to-Head AI comparison mode
- No black box — every score traceable

### 5. ⚡ Smart JD Analyzer
- Paste any JD → AI extracts requirements
- Instant semantic candidate matching
- Works with any job description format

### 6. 🛡️ Live Skill Verification
- 60-second Fix-the-Bug coding test
- AI generates unique question per candidate
- Anti-cheat: tab detection, server-side timer,
  difficulty scaling, Moire pattern overlay

### 7. 🚨 Smart Disqualification Engine
```
Hard Reject:    Accountant, Graphic Designer → cap 22
Soft Reject:    QA Engineer, .NET Dev        → cap 45
Consulting:     All consulting career        → x0.65
Inactive:       180+ days                   → x0.80
Outside India:                              → x0.87
```

### 8. 👥 Dual Portal System
- HR Portal: Dashboard, JD Analyzer, Compare, Export
- Candidate Portal: Browse Jobs, Upload Resume, Skill Test, My Profile

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
# ============================================
# TALENTLENS AI — Environment Configuration
# ============================================

# --- Google Gemini AI (FREE) ---
# Get key at: https://aistudio.google.com/app/apikey
# No credit card required
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# --- MongoDB Atlas (FREE) ---
# Create free cluster at: https://www.mongodb.com/atlas
# Format: mongodb+srv://username:password@cluster.xxxxx.mongodb.net/dbname
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
# Without token: 60 req/hr
# With token: 5000 req/hr
# Create at: https://github.com/settings/tokens
GITHUB_TOKEN=optional_github_personal_access_token
```

### How to Get Each Key

```
GEMINI_API_KEY:
  1. Go to https://aistudio.google.com
  2. Sign in with Google account
  3. Click "Get API Key"
  4. Click "Create API Key"
  5. Copy and paste into .env

MONGODB_URI:
  1. Go to https://www.mongodb.com/atlas
  2. Create free account
  3. Create M0 cluster (free forever)
  4. Click "Connect" → "Drivers"
  5. Copy connection string
  6. Replace <password> with your password
  7. Replace myFirstDatabase with talentlens_ai
  8. Add 0.0.0.0/0 to Network Access
```

---

## 🚀 Complete Setup Guide

### Prerequisites

```
Node.js 20+    → https://nodejs.org (download LTS)
Git            → https://git-scm.com
MongoDB Atlas  → https://www.mongodb.com/atlas (free account)
Gemini API Key → https://aistudio.google.com (free)
```

### Step 1 — Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/talentlens-ai.git
cd talentlens-ai
```

### Step 2 — Backend Setup

```bash
# Go to backend folder
cd backend

# Install all packages
npm install

# Create environment file
cp .env.example .env
# Windows:
# copy .env.example .env

# Open .env and fill in your keys
# GEMINI_API_KEY = your key from aistudio.google.com
# MONGODB_URI    = your Atlas connection string
```

### Step 3 — Start Backend Server

```bash
# Make sure you are in backend folder
cd backend

# Start development server
npm run dev

# You should see:
# ✅ MongoDB Atlas connected
# 🚀 Server running → http://localhost:5000
# 📋 Health check → http://localhost:5000/health
```

### Step 4 — Frontend Setup

```bash
# Open NEW terminal window
# Go to frontend folder
cd frontend

# Install all packages
npm install
```

### Step 5 — Start Frontend

```bash
# Make sure you are in frontend folder
cd frontend

# Start development server
npm run dev

# You should see:
# VITE ready in 1207ms
# Local: http://localhost:5173
```

### Step 6 — Open App

```
Open browser → http://localhost:5173
You will see TalentLens AI landing page!
```

### Step 7 — Load Hackathon Dataset

```bash
# Open NEW terminal window
cd backend

# Process and score all 50 candidates
node src/utils/processHackathonData.js
# Output: dataset/ranked_candidates.csv

# Import candidates to MongoDB
node src/utils/importHackathonCandidates.js
# You should see:
# ✅ MongoDB connected
# Importing 50 candidates...
# ✅ Done! Imported: 50
```

### Step 8 — Login and Explore

```
HR Admin Login:
  URL:      http://localhost:5173/login?role=admin
  Email:    admin@talentlens.ai
  Password: admin123

Candidate Login:
  URL:      http://localhost:5173/login?role=candidate
  Email:    email used during resume upload
```

---

## 📋 Quick Start (All Commands)

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/talentlens-ai.git
cd talentlens-ai

# 2. Backend (Terminal 1)
cd backend
npm install
cp .env.example .env
# Fill .env with GEMINI_API_KEY and MONGODB_URI
npm run dev

# 3. Frontend (Terminal 2)
cd frontend
npm install
npm run dev

# 4. Load Data (Terminal 3)
cd backend
node src/utils/importHackathonCandidates.js

# 5. Open browser
# http://localhost:5173
```

---

## 📁 Project Structure

```
talentlens-ai/
├── backend/
│   ├── src/
│   │   ├── server.js              ← Entry point
│   │   ├── models/
│   │   │   ├── Candidate.js       ← MongoDB schema
│   │   │   └── Job.js             ← Job schema
│   │   ├── routes/
│   │   │   ├── candidates.js      ← Upload + search
│   │   │   ├── jobs.js            ← Job CRUD
│   │   │   ├── explain.js         ← AI explainer
│   │   │   ├── jdparser.js        ← JD analyzer
│   │   │   ├── test.js            ← Micro test
│   │   │   ├── github.js          ← Verification
│   │   │   ├── dashboard.js       ← Rankings + CSV
│   │   │   └── auth.js            ← Login
│   │   └── utils/
│   │       ├── geminiClient.js    ← AI wrapper
│   │       ├── resumeParser.js    ← Parse logic
│   │       ├── redrobScorer.js    ← Main algorithm
│   │       ├── scoreCalculator.js ← Formula
│   │       ├── processHackathonData.js
│   │       └── importHackathonCandidates.js
│   ├── dataset/
│   │   ├── sample_candidates.json ← Redrob dataset
│   │   └── ranked_candidates.csv  ← Judge submission
│   ├── .env.example               ← Environment template
│   └── package.json
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Landing.jsx        ← Home page
│       │   ├── Login.jsx          ← Auth page
│       │   ├── Dashboard.jsx      ← HR dashboard
│       │   ├── JDParser.jsx       ← JD analyzer
│       │   ├── Jobs.jsx           ← Job listings
│       │   ├── CandidatePortal.jsx← Resume upload
│       │   ├── CandidateProfile.jsx← My profile
│       │   └── TestArena.jsx      ← Skill test
│       └── utils/
│           ├── api.js             ← HTTP client
│           └── auth.js            ← Auth helpers
└── README.md
```

---

## 🔧 Troubleshooting

```
Problem: MongoDB connection failed
Fix:     Check MONGODB_URI in .env
         Atlas → Network Access → Add 0.0.0.0/0

Problem: Gemini API error 404
Fix:     Check GEMINI_API_KEY in .env
         Verify key at aistudio.google.com

Problem: npm install fails
Fix:     node --version must show v20+
         Download from nodejs.org

Problem: Port 5000 in use
Fix:     Change PORT=5001 in .env

Problem: Frontend blank page
Fix:     Start backend first
         Check browser console for errors

Problem: Embedding fails
Fix:     Wait 1 minute (rate limit)
         Free tier: 1500 req/day
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
>
> All architectural decisions, business logic, scoring algorithms,
> and final implementations were directed, reviewed, and verified
> by the developer.
>
> The multi-signal scoring approach, behavioral signal integration,
> smart disqualification engine, and explainability features
> represent original problem-solving and domain understanding.
> Claude helped write the code — the developer designed the solution.
>
> Using AI tools to build AI products demonstrates exactly the
> kind of AI-first thinking this hackathon celebrates.

---

## 📜 License

MIT License — Free to use, modify, distribute.

---

## 👨‍💻 Built For

**India Runs Hackathon 2026**
Track 01 — Data & AI Challenge
Organized by Redrob & Hack2skill

*"Build what next India runs on"*