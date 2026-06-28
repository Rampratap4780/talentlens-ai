import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import { saveUser } from '../utils/auth'

export default function Login() {
  const [searchParams] = useSearchParams()
  const role = searchParams.get('role') || 'candidate'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let res

      if (role === 'admin') {
        res = await api.post('/auth/admin/login', {
          email,
          password,
        })
      } else {
        res = await api.post('/auth/candidate/login', {
          email,
        })
      }

      if (res.data.success) {
        saveUser(res.data.user)

        if (role === 'admin') {
          navigate('/hr')
        } else {
          navigate('/profile')
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = role === 'admin'

  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-xl font-bold text-white shadow-lg ${
              isAdmin
                ? 'bg-gradient-to-br from-blue-500 to-violet-600 shadow-blue-500/20'
                : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20'
            }`}
          >
            TL
          </div>

          <h1 className="text-2xl font-bold text-white">
            TalentLens AI
          </h1>

          <p className="text-gray-400 text-sm mt-1">
            {isAdmin ? 'HR Portal Login' : 'Candidate Login'}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex bg-gray-900 rounded-xl p-1 mb-6 border border-white/5">
          <button
            type="button"
            onClick={() => navigate('/login?role=candidate')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              !isAdmin
                ? 'bg-emerald-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🧑‍💻 Candidate
          </button>

          <button
            type="button"
            onClick={() => navigate('/login?role=admin')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              isAdmin
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            👔 HR Admin
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-gray-900 rounded-2xl border border-white/5 p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Email Address
              </label>

              <input
                type="email"
                required
                placeholder={
                  isAdmin
                    ? 'admin@talentlens.ai'
                    : 'your@email.com'
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Password (Admin Only) */}
            {isAdmin && (
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  Password
                </label>

                <input
                  type="password"
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            )}

            {/* Candidate Info */}
            {!isAdmin && (
              <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-3 text-xs text-blue-300">
                💡 Use the email you used when uploading your resume
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-900/30 border border-red-800 rounded-xl px-4 py-2.5 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed ${
                isAdmin
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20'
              }`}
            >
              {loading
                ? '⟳ Signing in...'
                : `Sign In as ${isAdmin ? 'HR Admin' : 'Candidate'}`}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-xs text-gray-600">or</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {/* Candidate CTA */}
          {!isAdmin && (
            <a
              href="/candidate"
              className="block w-full text-center py-2.5 border border-gray-700 hover:border-emerald-500 rounded-xl text-sm text-gray-400 hover:text-emerald-400 transition"
            >
              New here? Upload your resume first →
            </a>
          )}
        </div>

        {/* Back */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-xs text-gray-600 hover:text-gray-400 transition"
          >
            ← Back to Home
          </a>
        </div>

        {/* Demo Credentials */}
        {isAdmin && (
          <div className="mt-4 bg-gray-900/50 border border-white/5 rounded-xl p-4 text-xs text-gray-500">
            <p className="font-medium text-gray-400 mb-2">
              Demo Credentials:
            </p>
            <p>Email: admin@talentlens.ai</p>
            <p>Password: admin123</p>
          </div>
        )}
      </div>
    </div>
  )
}