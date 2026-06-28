import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser, logout } from '../utils/auth'
import api from '../utils/api'
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis,
    PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts'

export default function CandidateProfile() {
    const [candidate, setCandidate] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const user = getUser()

    useEffect(() => {
        if (!user || user.role !== 'candidate') {
            navigate('/login?role=candidate')
            return
        }
        loadProfile()
    }, [])

    async function loadProfile() {
        try {
            const res = await api.post('/auth/candidate/login', { email: user.email })
            setCandidate(res.data.candidate)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    function handleLogout() {
        logout()
        navigate('/')
    }

    function getRadarData(candidate) {
        const claimed = candidate?.skill_radar?.claimed || {}
        const verified = candidate?.skill_radar?.verified || {}
        const allKeys = [...new Set([...Object.keys(claimed), ...Object.keys(verified)])]
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

    function getStatusInfo(status) {
        const map = {
            shortlisted: { color: 'text-green-400', bg: 'bg-green-900/30 border-green-800', icon: '🎉', msg: 'Congratulations! You have been shortlisted.' },
            screening: { color: 'text-blue-400', bg: 'bg-blue-900/30 border-blue-800', icon: '👀', msg: 'Your profile is under review by HR.' },
            hired: { color: 'text-purple-400', bg: 'bg-purple-900/30 border-purple-800', icon: '🏆', msg: 'You have been hired! Check your email.' },
            rejected: { color: 'text-red-400', bg: 'bg-red-900/30 border-red-800', icon: '❌', msg: 'Not selected this time. Keep improving!' },
            applied: { color: 'text-gray-400', bg: 'bg-gray-800 border-gray-700', icon: '📝', msg: 'Application received. Results coming soon.' }
        }
        return map[status] || map.applied
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-400 animate-pulse">Loading profile...</div>
            </div>
        )
    }

    const statusInfo = getStatusInfo(candidate?.status)
    const overall = candidate?.final_scores?.overall_rank_score || 0
    const radarData = getRadarData(candidate)

    return (
        <div className="max-w-4xl mx-auto px-6 py-8">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">My Profile</h1>
                    <p className="text-gray-400 text-sm mt-1">Your application status & scores</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="text-sm text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-800 px-4 py-2 rounded-xl transition"
                >
                    Logout
                </button>
            </div>

            {/* Status Banner */}
            <div className={`border rounded-2xl p-4 mb-6 flex items-center gap-3 ${statusInfo.bg}`}>
                <span className="text-2xl">{statusInfo.icon}</span>
                <div>
                    <p className={`font-semibold ${statusInfo.color} capitalize`}>{candidate?.status}</p>
                    <p className="text-gray-300 text-sm">{statusInfo.msg}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Left — Info + Scores */}
                <div className="space-y-4">

                    {/* Basic Info */}
                    <div className="bg-gray-900 rounded-2xl border border-white/5 p-5">
                        <h2 className="font-semibold mb-4">Profile Info</h2>
                        <div className="space-y-3 text-sm">
                            {[
                                { label: 'Name', value: candidate?.name },
                                { label: 'Email', value: candidate?.email },
                                { label: 'Top Skill', value: candidate?.parsed_skills?.top_skill },
                                { label: 'Experience', value: `${candidate?.parsed_skills?.years_experience || 0} years` }
                            ].map(item => (
                                <div key={item.label} className="flex justify-between">
                                    <span className="text-gray-400">{item.label}</span>
                                    <span className="font-medium text-blue-400">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Overall Score */}
                    <div className="bg-gray-900 rounded-2xl border border-white/5 p-5">
                        <h2 className="font-semibold mb-4">Skill Trust Score</h2>
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`text-5xl font-bold ${getScoreColor(overall)}`}>
                                {overall}
                            </div>
                            <div>
                                <div className="text-gray-400 text-sm">out of 100</div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                    {overall >= 70 ? 'Strong candidate' :
                                        overall >= 50 ? 'Good potential' : 'Keep improving'}
                                </div>
                            </div>
                        </div>

                        {/* Score Breakdown */}
                        <div className="space-y-2">
                            {[
                                { label: 'Semantic Match', val: candidate?.final_scores?.semantic_match_score, color: 'bg-blue-500' },
                                { label: 'GitHub Trust', val: candidate?.final_scores?.github_trust_score, color: 'bg-green-500' },
                                { label: 'Skill Test', val: candidate?.final_scores?.micro_test_score, color: 'bg-purple-500' },
                                { label: 'Experience', val: candidate?.final_scores?.experience_score, color: 'bg-yellow-500' },
                                { label: 'Activity', val: candidate?.final_scores?.activity_score, color: 'bg-orange-500' }
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
                    </div>

                    {/* Test Status */}
                    <div className="bg-gray-900 rounded-2xl border border-white/5 p-5">
                        <h2 className="font-semibold mb-4">Skill Test</h2>
                        {candidate?.test_completed ? (
                            <div className="text-center py-4">
                                <div className="text-3xl mb-2">✅</div>
                                <p className="text-green-400 font-medium">Test Completed</p>
                                <p className="text-2xl font-bold mt-2">
                                    {candidate?.final_scores?.micro_test_score}/100
                                </p>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <div className="text-3xl mb-2">⚡</div>
                                <p className="text-gray-400 text-sm mb-3">
                                    Complete the 60-second skill test to boost your score
                                </p>

                                <a
                                    href={`/test?id=${candidate?.id}`}
                                    className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-xl text-sm font-medium transition"
                                >
                                    Take Skill Test →
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right — Radar Chart + Skills */}
                <div className="space-y-4">

                    {/* Radar Chart */}
                    <div className="bg-gray-900 rounded-2xl border border-white/5 p-5">
                        <h2 className="font-semibold mb-2">Skill Radar</h2>
                        <p className="text-xs text-gray-500 mb-4">Claimed vs AI-Verified Skills</p>
                        {radarData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={220}>
                                    <RadarChart data={radarData}>
                                        <PolarGrid stroke="#374151" />
                                        <PolarAngleAxis dataKey="skill" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                                        <PolarRadiusAxis domain={[0, 10]} tick={false} />
                                        <Radar name="Claimed" dataKey="Claimed" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                                        <Radar name="Verified" dataKey="Verified" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                                        <Tooltip contentStyle={{ background: '#1F2937', border: 'none', fontSize: '11px' }} />
                                    </RadarChart>
                                </ResponsiveContainer>
                                <div className="flex gap-4 text-xs justify-center mt-2">
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Claimed
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Verified
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-gray-500 py-8 text-sm">
                                No skill data yet
                            </div>
                        )}
                    </div>

                    {/* Skills */}
                    <div className="bg-gray-900 rounded-2xl border border-white/5 p-5">
                        <h2 className="font-semibold mb-4">Detected Skills</h2>
                        <div className="space-y-3">
                            {[
                                { label: 'Languages', skills: candidate?.parsed_skills?.languages || [] },
                                { label: 'Frameworks', skills: candidate?.parsed_skills?.frameworks || [] },
                                { label: 'Tools', skills: candidate?.parsed_skills?.tools || [] }
                            ].map(group => group.skills.length > 0 && (
                                <div key={group.label}>
                                    <p className="text-xs text-gray-500 mb-1.5">{group.label}</p>
                                    <div className="flex flex-wrap gap-1">
                                        {group.skills.map(s => (
                                            <span key={s} className="text-xs bg-gray-800 text-gray-300 border border-white/5 px-2 py-0.5 rounded">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="grid grid-cols-2 gap-3">

                        <a
                            href="/jobs"
                            className="bg-gray-900 border border-white/5 rounded-xl p-4 text-center hover:border-blue-500/30 transition card-hover"
                        >
                            <div className="text-2xl mb-1">💼</div>
                            <div className="text-sm font-medium">Browse Jobs</div>
                        </a>

                        <a
                            href="/candidate"
                            className="bg-gray-900 border border-white/5 rounded-xl p-4 text-center hover:border-emerald-500/30 transition card-hover"
                        >
                            <div className="text-2xl mb-1">📄</div>
                            <div className="text-sm font-medium">Update Resume</div>
                        </a>
                    </div>
                </div >
            </div >
        </div >
    )
}