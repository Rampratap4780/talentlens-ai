import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import CandidatePortal from './pages/CandidatePortal'
import TestArena from './pages/TestArena'
import JDParser from './pages/JDParser'
import Landing from './pages/Landing'
import Jobs from './pages/Jobs'
import Login from './pages/Login'
import CandidateProfile from './pages/CandidateProfile'

export default function App() {
  const location = useLocation()
  const isHR = location.pathname.startsWith('/hr')
  const isCandidate = location.pathname.startsWith('/candidate') ||
    location.pathname.startsWith('/jobs') ||
    location.pathname === '/test'
  const isLanding = location.pathname === '/'

  return (
    <div className="min-h-screen bg-[#020817] text-white">

      {/* HR Navbar */}
      {isHR && (
        <nav className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl bg-[#020817]/80">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-500/20">
                TL
              </div>
              <div>
                <span className="font-bold gradient-text">TalentLens AI</span>
                <div className="text-xs text-gray-500">HR Portal</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {[
                { path: '/hr', label: '📊 Dashboard' },
                { path: '/hr/jd', label: '🔍 JD Analyzer' },
              ].map(link => (
                <Link key={link.path} to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname === link.path
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}>
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-400 font-medium">Live</span>
              </div>
              <Link to="/" className="text-xs text-gray-500 hover:text-gray-300 transition">
                ← Home
              </Link>
            </div>
          </div>
        </nav>
      )}

      {/* Candidate Navbar */}
      {isCandidate && (
        <nav className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl bg-[#020817]/80">
          <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-emerald-500/20">
                TL
              </div>
              <div>
                <span className="font-bold text-emerald-400">TalentLens AI</span>
                <div className="text-xs text-gray-500">Candidate Portal</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {[
                { path: '/jobs', label: '💼 Browse Jobs' },
                { path: '/candidate', label: '📄 Upload Resume' },
                { path: '/test', label: '⚡ Skill Test' },
                { path: '/profile', label: '👤 My Profile' },
              ].map(link => (
                <Link key={link.path} to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname === link.path
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}>
                  {link.label}
                </Link>
              ))}
            </div>
            <Link to="/" className="text-xs text-gray-500 hover:text-gray-300 transition">
              ← Home
            </Link>
          </div>
        </nav>
      )}

      {/* Pages */}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/hr" element={<Dashboard />} />
        <Route path="/hr/jd" element={<JDParser />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/candidate" element={<CandidatePortal />} />
        <Route path="/test" element={<TestArena />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<CandidateProfile />} />
      </Routes>

      {/* Footer */}
      {!isLanding && (
        <footer className="border-t border-white/5 mt-16 py-4 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-600">
            <span>TalentLens AI — India Runs Hackathon 2026</span>
            <span>Gemini AI + MongoDB Atlas</span>
          </div>
        </footer>
      )}
    </div>
  )
}