import { useState } from 'react'
import api from '../utils/api'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts'

export default function JDParser() {
  const [jdText,     setJdText]     = useState('')
  const [loading,    setLoading]    = useState(false)
  const [result,     setResult]     = useState(null)
  const [error,      setError]      = useState('')
  const [step,       setStep]       = useState(1)

  const sampleJD = `Senior ML Engineer — Search & Ranking

We are looking for a Senior ML Engineer to join our Search & Ranking team.

Requirements:
- 5+ years of experience in ML/AI
- Strong expertise in NLP, embeddings, and vector search
- Experience with LLMs, RAG, and fine-tuning (LoRA, QLoRA)
- Proficiency in Python, PyTorch, and Hugging Face Transformers
- Experience with Elasticsearch, FAISS, Pinecone, or similar
- Knowledge of learning-to-rank algorithms (LambdaMART, XGBoost)
- Experience building recommendation systems at scale

Nice to have:
- Experience with Kafka, Spark, Airflow
- MLOps experience (Kubeflow, MLflow)
- Publications or open source contributions in NLP/IR

Location: Pune or Noida (Hybrid)`

  async function analyzeJD() {
    if (!jdText.trim() || jdText.length < 50) {
      setError('Please enter a complete job description')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    setStep(2)
    try {
      const res = await api.post('/jd/analyze', { job_description: jdText })
      setResult(res.data)
      setStep(3)
    } catch (e) {
      setError(e.response?.data?.message || 'Analysis failed. Try again.')
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  function getScoreColor(score) {
    if (score >= 70) return 'text-green-400'
    if (score >= 50) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-2">Smart JD Analyzer</h1>
      <p className="text-gray-400 text-sm mb-8">
        Paste any job description — AI instantly finds your best matching candidates
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left — JD Input */}
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Job Description</label>
              <button
                onClick={() => setJdText(sampleJD)}
                className="text-xs text-blue-400 hover:text-blue-300 transition"
              >
                Use Sample JD
              </button>
            </div>
            <textarea
              rows={16}
              placeholder="Paste job description here...&#10;&#10;Include:&#10;- Role title&#10;- Required skills&#10;- Experience needed&#10;- Responsibilities"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
              value={jdText}
              onChange={e => setJdText(e.target.value)}
            />

            {error && (
              <div className="mt-2 bg-red-900/30 border border-red-800 rounded-lg px-3 py-2 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={analyzeJD}
              disabled={loading || !jdText.trim()}
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="animate-spin text-lg">⟳</span> AI Analyzing JD...</>
              ) : (
                '🔍 Find Best Candidates'
              )}
            </button>
          </div>

          {/* Parsed JD Result */}
          {result?.parsed_jd && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="font-semibold mb-4">📋 JD Analysis</h3>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">Role: </span>
                  <span className="font-medium">{result.parsed_jd.title}</span>
                </div>
                <div>
                  <span className="text-gray-400">Experience: </span>
                  <span>{result.parsed_jd.experience_min}–{result.parsed_jd.experience_max} years</span>
                </div>
                <div>
                  <span className="text-gray-400">Location: </span>
                  <span>{result.parsed_jd.location}</span>
                </div>

                <div>
                  <p className="text-gray-400 mb-2">Required Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {(result.parsed_jd.required_skills || []).map(s => (
                      <span key={s} className="text-xs bg-blue-900/50 text-blue-300 border border-blue-800 px-2 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {(result.parsed_jd.preferred_skills || []).length > 0 && (
                  <div>
                    <p className="text-gray-400 mb-2">Nice to Have:</p>
                    <div className="flex flex-wrap gap-1">
                      {result.parsed_jd.preferred_skills.map(s => (
                        <span key={s} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.parsed_jd.summary && (
                  <div className="bg-gray-800 rounded-lg p-3 text-gray-300 text-xs leading-relaxed">
                    <p className="text-gray-400 font-medium mb-1">Ideal Candidate:</p>
                    {result.parsed_jd.summary}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right — Matched Candidates */}
        <div>
          {!result ? (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-5xl mb-4">🎯</div>
                <p className="font-medium mb-2">Paste a JD to get started</p>
                <p className="text-xs">AI will find the best matching candidates from your talent pool</p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h3 className="font-semibold">
                  🏆 Top {result.top_candidates?.length} Matches
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Ranked by semantic similarity to your JD
                </p>
              </div>

              <div className="overflow-y-auto max-h-[700px]">
                {(result.top_candidates || []).map((c, i) => (
                  <div key={c._id} className="px-6 py-4 border-b border-gray-800 hover:bg-gray-800 transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          i === 0 ? 'bg-yellow-500 text-black' :
                          i === 1 ? 'bg-gray-400 text-black' :
                          i === 2 ? 'bg-orange-600 text-white' :
                          'bg-gray-700'
                        }`}>
                          {i + 1}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{c.name}</div>
                          <div className="text-xs text-gray-400">{c.location} • {c.skills?.years_experience}y exp</div>
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${getScoreColor(c.semantic_score)}`}>
                        {c.semantic_score}%
                      </div>
                    </div>

                    {/* Match bar */}
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Semantic Match</span>
                        <span>{c.semantic_score}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full">
                        <div
                          className={`h-2 rounded-full ${
                            c.semantic_score >= 70 ? 'bg-green-500' :
                            c.semantic_score >= 50 ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${c.semantic_score}%` }}
                        />
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1">
                      {[
                        ...(c.skills?.tools      || []),
                        ...(c.skills?.languages  || []),
                        ...(c.skills?.frameworks || [])
                      ].slice(0, 5).map(skill => (
                        <span key={skill} className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}