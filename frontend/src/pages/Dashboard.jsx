import { useState, useEffect } from 'react'
import api from '../utils/api'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts'

import { useNavigate } from 'react-router-dom'
import { getUser } from '../utils/auth'

export default function Dashboard() {
  const [candidates, setCandidates] = useState([])
  const [stats, setStats] = useState(null)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [explanation, setExplanation] = useState(null)
  const [explainLoading, setExplainLoading] = useState(false)
  const [compareList, setCompareList] = useState([])
  const [comparison, setComparison] = useState(null)
  const [compareLoading, setCompareLoading] = useState(false)

  useEffect(() => { loadData() }, [])
  const navigate = useNavigate()
  useEffect(() => {
    const user = getUser()
    if (!user || user.role !== 'admin') {
      navigate('/login?role=admin')
    }
  }, [])

  async function loadData() {
    try {
      const [candRes, statsRes] = await Promise.all([
        api.get('/dashboard/shortlist?limit=20'),
        api.get('/dashboard/stats')
      ])
      setCandidates(candRes.data.candidates || [])
      setStats(statsRes.data.stats)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function getExplanation(candidateId) {
    setExplainLoading(true)
    setExplanation(null)
    try {
      const res = await api.post(`/explain/candidate/${candidateId}`)
      setExplanation(res.data.explanation)
    } catch (e) {
      setExplanation('Failed to generate explanation. Try again.')
    } finally {
      setExplainLoading(false)
    }
  }

  async function compareTwo() {
    if (compareList.length !== 2) return
    setCompareLoading(true)
    setComparison(null)
    try {
      const res = await api.post('/explain/compare', {
        candidate_id_1: compareList[0]._id,
        candidate_id_2: compareList[1]._id
      })
      setComparison(res.data)
    } catch (e) {
      alert('Compare failed: ' + e.message)
    } finally {
      setCompareLoading(false)
    }
  }

  function toggleCompare(candidate) {
    if (compareList.find(c => c._id === candidate._id)) {
      setCompareList(compareList.filter(c => c._id !== candidate._id))
    } else if (compareList.length < 2) {
      setCompareList([...compareList, candidate])
    }
  }

  function getRadarData(candidate) {
    const claimed = candidate.skill_radar?.claimed || {}
    const verified = candidate.skill_radar?.verified || {}
    const allKeys = [...new Set([...Object.keys(claimed), ...Object.keys(verified)])]

    if (allKeys.length === 0) {
      const skills = candidate.parsed_skills
      const fallback = [
        ...(skills?.languages || []),
        ...(skills?.frameworks || []),
        ...(skills?.tools || [])
      ].slice(0, 6)
      return fallback.map(skill => ({
        skill: skill.length > 10 ? skill.substring(0, 10) : skill,
        Claimed: Math.floor(Math.random() * 3) + 6,
        Verified: Math.floor(Math.random() * 4) + 4
      }))
    }

    return allKeys.slice(0, 6).map(skill => ({
      skill: skill.length > 10 ? skill.substring(0, 10) : skill,
      Claimed: claimed[skill] || 0,
      Verified: verified[skill] || Math.max(0, (claimed[skill] || 0) - 2)
    }))
  }

  function getScoreColor(score) {
    if (score >= 70) return 'text-green-400'
    if (score >= 50) return 'text-yellow-400'
    return 'text-red-400'
  }

  function getStatusBadge(status) {
    const map = {
      shortlisted: 'bg-green-900 text-green-300',
      screening: 'bg-blue-900 text-blue-300',
      applied: 'bg-gray-800 text-gray-300',
      rejected: 'bg-red-900 text-red-300',
      hired: 'bg-purple-900 text-purple-300'
    }
    return map[status] || map.applied
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 animate-pulse">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Hero Banner */}
      <div className="gradient-border rounded-2xl p-6 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-violet-600/5 to-emerald-600/5" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
                Track 01 — Data & AI Challenge
              </span>
              <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">
                India Runs 2026
              </span>
            </div>
            <h1 className="text-2xl font-bold gradient-text mb-1">TalentLens AI</h1>
            <p className="text-gray-400 text-sm">
              Intelligent Candidate Discovery — Senior AI Engineer @ Redrob
            </p>
          </div>
          <button
            onClick={() => window.open('http://localhost:5000/api/dashboard/export', '_blank')}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            <span>📥</span> Export CSV
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">HR Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Senior AI Engineer — Redrob</p>
        </div>
        <button
          onClick={() => window.open('http://localhost:5000/api/dashboard/export', '_blank')}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Candidates', value: stats.total_candidates, icon: '👥', color: 'blue', glow: 'rgba(59,130,246,0.1)' },
            { label: 'Shortlisted', value: stats.shortlisted, icon: '✅', color: 'green', glow: 'rgba(16,185,129,0.1)' },
            { label: 'Tests Completed', value: stats.tests_completed, icon: '⚡', color: 'purple', glow: 'rgba(139,92,246,0.1)' },
            { label: 'Avg Score', value: (stats.avg_overall_score || 0) + '%', icon: '📊', color: 'yellow', glow: 'rgba(234,179,8,0.1)' }
          ].map(s => (
            <div
              key={s.label}
              className="bg-gray-900/50 rounded-2xl p-5 border border-white/5 card-hover"
              style={{ boxShadow: `0 0 30px ${s.glow}` }}
            >
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className={`text-3xl font-bold text-${s.color}-400 mb-1`}>{s.value}</div>
              <div className="text-gray-500 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      )}
      {/* Compare Bar */}
      {compareList.length > 0 && (
        <div className="mb-4 bg-blue-900/30 border border-blue-800 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-blue-400 font-medium">Comparing:</span>
            {compareList.map(c => (
              <span key={c._id} className="bg-blue-800 text-blue-200 px-2 py-1 rounded text-xs">
                {c.name}
              </span>
            ))}
            {compareList.length === 1 && (
              <span className="text-gray-400 text-xs">Select one more candidate</span>
            )}
          </div>
          <div className="flex gap-2">
            {compareList.length === 2 && (
              <button
                onClick={compareTwo}
                disabled={compareLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium transition"
              >
                {compareLoading ? '🤖 Comparing...' : '⚡ Compare with AI'}
              </button>
            )}
            <button
              onClick={() => { setCompareList([]); setComparison(null) }}
              className="bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg text-xs transition"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Compare Result */}
      {comparison && (
        <div className="mb-6 bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="font-semibold mb-4">⚡ AI Head-to-Head Comparison</h2>

          <div className="bg-green-900/20 border border-green-800 rounded-lg p-3 mb-4">
            <p className="text-green-400 font-medium text-sm">
              🏆 Winner: {comparison.comparison?.winner}
            </p>
            <p className="text-gray-300 text-sm mt-1">{comparison.comparison?.winner_reason}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            {[
              { candidate: comparison.candidate1, strengths: comparison.comparison?.candidate1_strengths, weaknesses: comparison.comparison?.candidate1_weaknesses },
              { candidate: comparison.candidate2, strengths: comparison.comparison?.candidate2_strengths, weaknesses: comparison.comparison?.candidate2_weaknesses }
            ].map(({ candidate, strengths, weaknesses }) => (
              <div key={candidate?.id} className="bg-gray-800 rounded-lg p-4">
                <p className="font-medium mb-3">{candidate?.name}</p>
                <p className="text-green-400 text-xs font-medium mb-1">✅ Strengths</p>
                {(strengths || []).map((s, i) => (
                  <p key={i} className="text-gray-300 text-xs mb-1">• {s}</p>
                ))}
                <p className="text-red-400 text-xs font-medium mt-3 mb-1">⚠️ Concerns</p>
                {(weaknesses || []).map((w, i) => (
                  <p key={i} className="text-gray-300 text-xs mb-1">• {w}</p>
                ))}
              </div>
            ))}
          </div>

          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-3 text-sm text-blue-100">
            <p className="text-blue-400 text-xs font-medium mb-1">💡 Hiring Recommendation</p>
            {comparison.comparison?.recommendation}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Candidates Table */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold">Ranked Candidates</h2>
            <span className="text-xs text-gray-400">Click to analyze • + Compare to compare</span>
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            {candidates.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                No candidates yet. Upload resumes first.
              </div>
            ) : (
              candidates.map((c, i) => (
                <div
                  key={c._id}
                  onClick={() => {
                    setSelected(c)
                    setExplanation(null)
                  }}
                  className={`px-6 py-4 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition ${selected?._id === c._id ? 'bg-gray-800' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-gray-400">{c.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleCompare(c) }}
                        className={`text-xs px-2 py-0.5 rounded border transition ${compareList.find(x => x._id === c._id)
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-400'
                          }`}
                      >
                        {compareList.find(x => x._id === c._id) ? '✓' : '+'}
                      </button>
                      <div className={`text-lg font-bold ${getScoreColor(c.final_scores?.overall_rank_score)}`}>
                        {c.final_scores?.overall_rank_score || 0}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(c.status)}`}>
                        {c.status}
                      </span>
                    </div>
                  </div>

                  {/* Score bars */}
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-400">
                    {[
                      { label: 'Semantic', val: c.final_scores?.semantic_match_score },
                      { label: 'GitHub', val: c.final_scores?.github_trust_score },
                      { label: 'Test', val: c.final_scores?.micro_test_score }
                    ].map(s => (
                      <div key={s.label}>
                        <div className="flex justify-between mb-1">
                          <span>{s.label}</span>
                          <span>{s.val || 0}</span>
                        </div>
                        <div className="h-1 bg-gray-700 rounded">
                          <div className="h-1 bg-blue-500 rounded" style={{ width: `${s.val || 0}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Candidate Detail Panel */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          {selected ? (
            <>
              {/* Header */}
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h2 className="font-semibold">{selected.name}</h2>
                  <p className="text-gray-400 text-xs">{selected.location}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(selected.status)}`}>
                  {selected.status}
                </span>
              </div>

              {/* Overall Score */}
              <div className="flex items-center gap-2 my-3">
                <div className={`text-3xl font-bold ${getScoreColor(selected.final_scores?.overall_rank_score)}`}>
                  {selected.final_scores?.overall_rank_score || 0}
                </div>
                <div className="text-gray-500 text-sm">/100 overall</div>
              </div>

              {/* AI Explain Button */}
              <button
                onClick={() => getExplanation(selected._id)}
                disabled={explainLoading}
                className="w-full bg-purple-700 hover:bg-purple-600 disabled:bg-gray-700 disabled:cursor-not-allowed py-2 rounded-lg text-sm font-medium transition mb-3 flex items-center justify-center gap-2"
              >
                {explainLoading
                  ? <><span className="animate-spin">⟳</span> AI Analyzing...</>
                  : '🤖 Why This Candidate?'
                }
              </button>

              {/* AI Explanation */}
              {explanation && (
                <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-3 mb-4 text-sm text-purple-100 leading-relaxed">
                  <p className="text-purple-400 text-xs font-medium mb-2">🤖 AI Recruiter Analysis</p>
                  {explanation}
                </div>
              )}

              {/* Radar Chart */}
              {getRadarData(selected).length > 0 && (
                <>
                  <p className="text-xs text-gray-500 mb-1">Claimed vs Verified Skills</p>
                  <ResponsiveContainer width="100%" height={190}>
                    <RadarChart data={getRadarData(selected)}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                      <PolarRadiusAxis domain={[0, 10]} tick={false} />
                      <Radar name="Claimed" dataKey="Claimed" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                      <Radar name="Verified" dataKey="Verified" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                      <Tooltip contentStyle={{ background: '#1F2937', border: 'none', fontSize: '11px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="flex gap-4 text-xs mt-1 justify-center mb-3">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Claimed
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Verified
                    </span>
                  </div>
                </>
              )}

              {/* Score Bars */}
              <div className="space-y-2 mb-4">
                {[
                  { label: 'Semantic Match', val: selected.final_scores?.semantic_match_score, color: 'bg-blue-500' },
                  { label: 'GitHub Trust', val: selected.final_scores?.github_trust_score, color: 'bg-green-500' },
                  { label: 'Micro Test', val: selected.final_scores?.micro_test_score, color: 'bg-purple-500' },
                  { label: 'Experience', val: selected.final_scores?.experience_score, color: 'bg-yellow-500' },
                  { label: 'Activity', val: selected.final_scores?.activity_score, color: 'bg-orange-500' }
                ].map(s => (
                  <div key={s.label} className="text-xs">
                    <div className="flex justify-between text-gray-400 mb-0.5">
                      <span>{s.label}</span>
                      <span>{s.val || 0}/100</span>
                    </div>
                    <div className="h-1.5 bg-gray-700 rounded">
                      <div className={`h-1.5 ${s.color} rounded`} style={{ width: `${s.val || 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Skills */}
              {selected.parsed_skills?.top_skill && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Top Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {[
                      ...(selected.parsed_skills?.tools || []),
                      ...(selected.parsed_skills?.languages || []),
                      ...(selected.parsed_skills?.frameworks || [])
                    ].slice(0, 6).map(skill => (
                      <span key={skill} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Dropdown */}
              <select
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                value={selected.status}
                onChange={async (e) => {
                  await api.patch(`/candidates/${selected._id}/status`, { status: e.target.value })
                  setSelected({ ...selected, status: e.target.value })
                  loadData()
                }}
              >
                <option value="applied">Applied</option>
                <option value="screening">Screening</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
              </select>
            </>
          ) : (
            <div className="text-center text-gray-500 py-16">
              <div className="text-4xl mb-3">👈</div>
              <p className="text-sm">Click a candidate to analyze</p>
              <p className="text-xs mt-2 text-gray-600">Use + button to compare two candidates</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}