import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../utils/api'

export default function CandidatePortal() {
  const [searchParams]                  = useSearchParams()
  const [mode,        setMode]          = useState('text')
  const [resumeText,  setResumeText]    = useState('')
  const [pdfFile,     setPdfFile]       = useState(null)
  const [githubUser,  setGithubUser]    = useState('')
  const [jobId,       setJobId]         = useState('')
  const [loading,     setLoading]       = useState(false)
  const [result,      setResult]        = useState(null)
  const [error,       setError]         = useState('')
  const [step,        setStep]          = useState(1)
  const [dragOver,    setDragOver]      = useState(false)
  const fileRef                         = useRef(null)

  useEffect(() => {
    const jId = searchParams.get('jobId')
    if (jId) setJobId(jId)
  }, [])

  async function handleSubmit() {
    if (mode === 'text' && !resumeText.trim()) {
      setError('Resume text required')
      return
    }
    if (mode === 'pdf' && !pdfFile) {
      setError('Please select a PDF file')
      return
    }
    setLoading(true)
    setError('')
    setStep(2)
    try {
      let res
      if (mode === 'pdf') {
        const formData = new FormData()
        formData.append('resume', pdfFile)
        if (jobId)      formData.append('job_id', jobId)
        if (githubUser) formData.append('github_username', githubUser)
        res = await api.post('/candidates/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        res = await api.post('/candidates/upload', {
          resume_text:     resumeText,
          job_id:          jobId      || undefined,
          github_username: githubUser || undefined
        })
      }
      setStep(3)
      setResult(res.data.candidate)
    } catch (e) {
      setError(e.response?.data?.message || 'Upload failed. Try again.')
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.type === 'application/pdf') {
      setPdfFile(file)
      setError('')
    } else {
      setError('Only PDF files are supported')
    }
  }

  function handleFileSelect(e) {
    const file = e.target.files[0]
    if (file?.type === 'application/pdf') {
      setPdfFile(file)
      setError('')
    } else {
      setError('Only PDF files are supported')
    }
  }

  function resetForm() {
    setResult(null)
    setStep(1)
    setResumeText('')
    setPdfFile(null)
    setGithubUser('')
    setJobId('')
    setError('')
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-2">Candidate Portal</h1>
      <p className="text-gray-400 text-sm mb-8">
        Upload your resume for AI-powered skill analysis and ranking
      </p>

      <div className="flex items-center gap-2 mb-8">
        {['Upload Resume', 'AI Analysis', 'Complete'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > i ? 'bg-green-600 text-white' : step === i+1 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
              {step > i ? '✓' : i + 1}
            </div>
            <span className={`text-sm ${step === i+1 ? 'text-white' : 'text-gray-500'}`}>{s}</span>
            {i < 2 && <div className="w-8 h-px bg-gray-700" />}
          </div>
        ))}
      </div>

      {result ? (
        <div className="bg-gray-900 rounded-xl border border-green-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-900 rounded-full flex items-center justify-center text-2xl">✅</div>
            <div>
              <h2 className="font-semibold text-lg">Resume Processed!</h2>
              <p className="text-gray-400 text-sm">AI has analyzed your profile</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 space-y-3 mb-4 text-sm">
            {[
              { label: 'Name',       value: result.name },
              { label: 'Email',      value: result.email },
              { label: 'Top Skill',  value: result.skills?.top_skill },
              { label: 'Experience', value: `${result.skills?.years_experience || 0} years` }
            ].map(item => (
              <div key={item.label} className="flex justify-between">
                <span className="text-gray-400">{item.label}</span>
                <span className="font-medium text-blue-400">{item.value}</span>
              </div>
            ))}
          </div>

          {jobId && (
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg px-3 py-2 mb-4 text-xs text-blue-300">
              ✅ Applied to job successfully
            </div>
          )}

          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Skills Detected</p>
            <div className="flex flex-wrap gap-1">
              {[
                ...(result.skills?.languages  || []),
                ...(result.skills?.frameworks || []),
                ...(result.skills?.tools      || [])
              ].slice(0, 10).map(s => (
                <span key={s} className="text-xs bg-blue-900/50 text-blue-300 border border-blue-800 px-2 py-0.5 rounded">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <a
              href={`/test?id=${result.id}`}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-center py-2.5 rounded-lg text-sm font-medium transition"
            >
              Take Skill Test →
            </a>
            <button
              onClick={resetForm}
              className="flex-1 bg-gray-800 hover:bg-gray-700 py-2.5 rounded-lg text-sm transition"
            >
              Upload Another
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">

          {jobId && (
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg px-3 py-2 text-xs text-blue-300">
              📋 Applying for Job ID: <span className="font-mono">{jobId}</span>
            </div>
          )}

          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => { setMode('pdf'); setError('') }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${mode === 'pdf' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              📄 Upload PDF
            </button>
            <button
              onClick={() => { setMode('text'); setError('') }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${mode === 'text' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              ✏️ Paste Text
            </button>
          </div>

          {mode === 'pdf' && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${dragOver ? 'border-blue-500 bg-blue-900/20' : pdfFile ? 'border-green-600 bg-green-900/10' : 'border-gray-700 hover:border-gray-500'}`}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
              {pdfFile ? (
                <>
                  <div className="text-4xl mb-2">📄</div>
                  <p className="font-medium text-green-400">{pdfFile.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{(pdfFile.size / 1024).toFixed(0)} KB • Click to change</p>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-3">📁</div>
                  <p className="font-medium mb-1">Drop PDF here or click to browse</p>
                  <p className="text-xs text-gray-400">Supports PDF files up to 10MB</p>
                </>
              )}
            </div>
          )}

          {mode === 'text' && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Resume Text</label>
              <textarea
                rows={10}
                placeholder="Paste your resume here..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">GitHub Username (optional)</label>
              <input
                type="text"
                placeholder="e.g. torvalds"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                value={githubUser}
                onChange={e => setGithubUser(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Job ID (optional)</label>
              <input
                type="text"
                placeholder="Auto-filled from job listing"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                value={jobId}
                onChange={e => setJobId(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-lg px-3 py-2 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || (mode === 'text' ? !resumeText.trim() : !pdfFile)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <><span className="animate-spin text-lg">⟳</span> {step === 2 ? 'AI Analyzing Resume...' : 'Processing...'}</>
            ) : (
              `Analyze ${mode === 'pdf' ? 'PDF' : 'Resume'} with AI →`
            )}
          </button>
        </div>
      )}
    </div>
  )
}