import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function Jobs() {
  const [jobs,    setJobs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [applied, setApplied] = useState({})
  const navigate = useNavigate()

  useEffect(() => { loadJobs() }, [])

  async function loadJobs() {
    try {
      const res = await api.get('/jobs')
      setJobs(res.data.jobs || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 animate-pulse">Loading jobs...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-2">Open Positions</h1>
      <p className="text-gray-400 text-sm mb-8">
        Find your next opportunity — apply with your resume
      </p>

      {jobs.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl border border-white/5 p-12 text-center">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-gray-400">No open positions right now</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div
              key={job._id}
              className="bg-gray-900/50 rounded-2xl border border-white/5 p-6 card-hover"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-bold text-lg">{job.title}</h2>
                    {job.is_active && (
                      <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">
                        Hiring
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span>🏢 {job.company}</span>
                    {job.location && <span>📍 {job.location}</span>}
                    {job.experience_required > 0 && (
                      <span>⏱️ {job.experience_required}+ years</span>
                    )}
                    <span className="capitalize">💼 {job.job_type || 'full-time'}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/candidate?jobId=${job._id}`)}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-sm font-medium transition shadow-lg shadow-blue-500/20 whitespace-nowrap"
                >
                  Apply Now →
                </button>
              </div>

              <p className="text-gray-300 text-sm mb-4 leading-relaxed line-clamp-3">
                {job.description}
              </p>

              {/* Required Skills */}
              {job.required_skills?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {job.required_skills.map(s => (
                      <span key={s} className="text-xs bg-blue-900/50 text-blue-300 border border-blue-800/50 px-2 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Preferred Skills */}
              {job.preferred_skills?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Nice to Have</p>
                  <div className="flex flex-wrap gap-1">
                    {job.preferred_skills.map(s => (
                      <span key={s} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}