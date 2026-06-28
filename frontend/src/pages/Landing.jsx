import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#020817] flex flex-col">

      {/* Navbar */}
      <nav className="px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-500/20">
            TL
          </div>
          <span className="font-bold text-lg gradient-text">TalentLens AI</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full">
            India Runs 2026
          </span>
          <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full">
            Track 01 — Data & AI
          </span>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">

        {/* Badge */}
        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full text-sm text-blue-400 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Intelligent Candidate Discovery Platform
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Hire Smarter with{' '}
          <span className="gradient-text">AI</span>
        </h1>

        <p className="text-gray-400 text-lg max-w-2xl mb-12 leading-relaxed">
          Stop keyword matching. Start understanding candidates.
          TalentLens AI ranks talent the way a great recruiter would —
          with context, signals, and intelligence.
        </p>

        {/* Two Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-12">

          {/* HR Card */}
          <Link to="/login?role=admin" className="group">
            <div className="gradient-border rounded-2xl p-6 text-left card-hover h-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-violet-600/5 group-hover:from-blue-600/10 group-hover:to-violet-600/10 transition-all" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-2xl mb-4">
                  👔
                </div>
                <h2 className="font-bold text-lg mb-2">HR Portal</h2>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  View AI-ranked candidates, analyze job descriptions, compare talent, and export shortlists.
                </p>
                <ul className="space-y-1.5 text-xs text-gray-500 mb-5">
                  {[
                    '📊 AI-ranked candidate dashboard',
                    '🔍 Smart JD analyzer',
                    '🤖 Why this candidate? explainer',
                    '⚡ Head-to-head AI comparison',
                    '📥 Export ranked CSV'
                  ].map(f => <li key={f}>{f}</li>)}
                </ul>
                <div className="flex items-center gap-2 text-blue-400 text-sm font-medium group-hover:gap-3 transition-all">
                  Enter HR Portal <span>→</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Candidate Card */}
         <Link to="/login?role=candidate" className="group">
            <div className="rounded-2xl p-6 text-left card-hover h-full border border-white/5 bg-gray-900/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-teal-600/5 group-hover:from-emerald-600/10 group-hover:to-teal-600/10 transition-all" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-2xl mb-4">
                  🧑‍💻
                </div>
                <h2 className="font-bold text-lg mb-2">Candidate Portal</h2>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  Browse open jobs, upload your resume, get AI skill analysis, and prove yourself with a live test.
                </p>
                <ul className="space-y-1.5 text-xs text-gray-500 mb-5">
                  {[
                    '💼 Browse open positions',
                    '📄 Upload PDF or paste resume',
                    '🤖 AI skill extraction & analysis',
                    '⚡ 60-second live coding test',
                    '📊 Get your Skill Trust Score'
                  ].map(f => <li key={f}>{f}</li>)}
                </ul>
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium group-hover:gap-3 transition-all">
                  Browse Jobs <span>→</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-8 md:gap-12 text-center border border-white/5 bg-gray-900/30 rounded-2xl px-8 py-5">
          {[
            { value: '50+',    label: 'Candidates Ranked' },
            { value: '8',      label: 'Behavioral Signals' },
            { value: '96/100', label: 'Top Score'          },
            { value: '100%',   label: 'Free Stack'         }
          ].map(s => (
            <div key={s.label}>
              <div className="text-2xl font-bold gradient-text">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-16 w-full max-w-3xl">
          <h2 className="text-xl font-bold mb-8 text-gray-300">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '01', icon: '📝', title: 'Post a Job', desc: 'HR posts job description. AI extracts required skills, experience, and location automatically.' },
              { step: '02', icon: '🤖', title: 'AI Ranks Candidates', desc: 'Semantic matching + 8 behavioral signals + career quality = verified Skill Trust Score.' },
              { step: '03', icon: '🎯', title: 'Hire the Right Person', desc: 'Get explainable rankings, compare candidates head-to-head, export shortlist instantly.' }
            ].map(item => (
              <div key={item.step} className="bg-gray-900/50 border border-white/5 rounded-xl p-5 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs text-blue-400 font-mono font-bold">{item.step}</span>
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-5 px-6 text-center text-xs text-gray-600">
        TalentLens AI — Built for India Runs Hackathon 2026 •
        Powered by Gemini AI + MongoDB Atlas • 100% Free Stack
      </footer>
    </div>
  )
}