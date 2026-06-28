import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../utils/api'

export default function TestArena() {
  const [searchParams]                = useSearchParams()
  const candidateId                   = searchParams.get('id')

  const [phase,         setPhase]     = useState('enter')   // enter | ready | testing | result
  const [inputId,       setInputId]   = useState(candidateId || '')
  const [question,      setQuestion]  = useState(null)
  const [answer,        setAnswer]    = useState('')
  const [timeLeft,      setTimeLeft]  = useState(60)
  const [result,        setResult]    = useState(null)
  const [tabWarnings,   setTabWarnings]  = useState(0)
  const [loading,       setLoading]   = useState(false)
  const [showWarning,   setShowWarning] = useState(false)
  const timerRef                      = useRef(null)
  const startTimeRef                  = useRef(null)

  // ── Anti-cheat: Tab switch detection ─────────────────────────
  useEffect(() => {
    if (phase !== 'testing') return

    function handleVisibilityChange() {
      if (document.hidden) {
        // Report to backend
        api.post('/test/penalty', { candidate_id: inputId }).catch(() => {})
        setTabWarnings(prev => prev + 1)
        setShowWarning(true)
        setTimeout(() => setShowWarning(false), 3000)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [phase, inputId])

  // ── Timer ─────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'testing') return

    startTimeRef.current = Date.now()
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleSubmit(true) // auto submit when time runs out
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [phase])

  async function startTest() {
    if (!inputId.trim()) return
    setLoading(true)
    try {
      const res = await api.post('/test/start', { candidate_id: inputId })
      setQuestion(res.data.test)
      setTimeLeft(60)
      setAnswer('')
      setTabWarnings(0)
      setPhase('testing')
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to start test')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(autoSubmit = false) {
    clearInterval(timerRef.current)
    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000)
    setLoading(true)
    try {
      const res = await api.post('/test/submit', {
        candidate_id:       inputId,
        answer:             autoSubmit ? '(Time expired - no answer)' : answer,
        time_taken_seconds: timeTaken
      })
      setResult(res.data.result)
      setPhase('result')
    } catch (e) {
      alert('Submit failed: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const timerColor = timeLeft <= 10 ? 'text-red-400' :
                     timeLeft <= 20 ? 'text-yellow-400' : 'text-green-400'

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-2">Test Arena</h1>
      <p className="text-gray-400 text-sm mb-8">60-Second Fix-the-Bug Challenge</p>

      {/* Tab switch warning banner */}
      {showWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-pulse">
          ⚠️ Tab switch detected! Penalty applied. ({tabWarnings} warning{tabWarnings > 1 ? 's' : ''})
        </div>
      )}

      {/* PHASE: Enter ID */}
      {phase === 'enter' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="font-semibold mb-4">Enter Your Candidate ID</h2>
          <input
            type="text"
            placeholder="Paste your candidate ID here"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:border-blue-500"
            value={inputId}
            onChange={e => setInputId(e.target.value)}
          />

          {/* Rules */}
          <div className="bg-gray-800 rounded-lg p-4 mb-4 text-sm space-y-2">
            <p className="font-medium text-yellow-400">⚠️ Test Rules</p>
            <p className="text-gray-300">• You have exactly <strong>60 seconds</strong></p>
            <p className="text-gray-300">• Find and fix the bug in the given code</p>
            <p className="text-gray-300">• Switching tabs will be detected and penalized</p>
            <p className="text-gray-300">• Refreshing increases difficulty level</p>
            <p className="text-gray-300">• Timer runs server-side — cannot be cheated</p>
          </div>

          <button
            onClick={startTest}
            disabled={loading || !inputId.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 py-3 rounded-lg font-medium transition"
          >
            {loading ? 'Generating Question...' : 'Start Test →'}
          </button>
        </div>
      )}

      {/* PHASE: Testing */}
      {phase === 'testing' && question && (
        <div className="space-y-4">

          {/* Header bar */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400">Language: </span>
              <span className="text-blue-400 font-medium">{question.language}</span>
              <span className="mx-2 text-gray-600">|</span>
              <span className="text-xs text-gray-400">Difficulty: </span>
              <span className="text-yellow-400 font-medium">Level {question.difficulty_level}</span>
              {tabWarnings > 0 && (
                <>
                  <span className="mx-2 text-gray-600">|</span>
                  <span className="text-red-400 text-xs">⚠️ {tabWarnings} tab switch penalty</span>
                </>
              )}
            </div>
            <div className={`text-3xl font-bold font-mono ${timerColor}`}>
              {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
          </div>

          {/* Question */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <p className="text-sm text-gray-400 mb-3">
              🐛 Find and fix the bug in this <strong className="text-white">{question.language}</strong> code:
            </p>

            {/* Moire anti-cheat overlay on code */}
            <div className="relative">
              <pre className="bg-gray-950 rounded-lg p-4 text-sm font-mono text-green-300 overflow-x-auto whitespace-pre-wrap border border-gray-700">
                {question.buggy_code}
              </pre>
              {/* Anti-screenshot moire pattern */}
              <div
                className="absolute inset-0 rounded-lg pointer-events-none opacity-5"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.8) 2px, rgba(255,255,255,0.8) 4px), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.8) 2px, rgba(255,255,255,0.8) 4px)'
                }}
              />
            </div>
          </div>

          {/* Answer */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <label className="block text-sm text-gray-400 mb-2">
              Your Fix — Write the corrected code or explain the fix:
            </label>
            <textarea
              rows={6}
              placeholder="Write your answer here..."
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500 resize-none"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              autoFocus
            />
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading || !answer.trim()}
              className="w-full mt-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 py-3 rounded-lg font-medium transition"
            >
              {loading ? 'AI Evaluating...' : 'Submit Answer'}
            </button>
          </div>
        </div>
      )}

      {/* PHASE: Result */}
      {phase === 'result' && result && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className={`text-5xl mb-4 ${result.is_correct ? '' : ''}`}>
            {result.is_correct ? '✅' : '❌'}
          </div>
          <h2 className="text-xl font-bold mb-1">
            {result.is_correct ? 'Correct!' : 'Incorrect'}
          </h2>

          <div className="flex items-center gap-4 my-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                result.final_score >= 70 ? 'text-green-400' :
                result.final_score >= 40 ? 'text-yellow-400' : 'text-red-400'
              }`}>{result.final_score}</div>
              <div className="text-xs text-gray-400">Final Score</div>
            </div>
            {result.raw_score !== result.final_score && (
              <div className="text-center">
                <div className="text-xl text-gray-500 line-through">{result.raw_score}</div>
                <div className="text-xs text-gray-400">Raw Score</div>
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-300 mb-4">
            <p className="font-medium text-white mb-1">AI Feedback:</p>
            <p>{result.feedback}</p>
          </div>

          {(result.penalties?.tab_switches > 0 || result.penalties?.refresh_count > 0) && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-sm text-red-400 mb-4">
              <p className="font-medium mb-1">Penalties Applied:</p>
              {result.penalties.tab_switches > 0 && (
                <p>• Tab switches: {result.penalties.tab_switches} × 5 = -{result.penalties.tab_switches * 5} points</p>
              )}
              {result.penalties.refresh_count > 0 && (
                <p>• Refreshes: {result.penalties.refresh_count} × 3 = -{result.penalties.refresh_count * 3} points</p>
              )}
            </div>
          )}

          <button
            onClick={() => { setPhase('enter'); setResult(null); setQuestion(null) }}
            className="w-full bg-gray-800 hover:bg-gray-700 py-2 rounded-lg text-sm transition"
          >
            Back to Start
          </button>
        </div>
      )}
    </div>
  )
}