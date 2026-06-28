import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  name:            { type: String, required: true, trim: true },
  email:           { type: String, required: true, unique: true, lowercase: true },
  phone:           { type: String },
  location:        { type: String },
  github_username: { type: String },

  resume_text:   { type: String, required: true },
  resume_vector: { type: [Number], default: [] },

  parsed_skills: {
    languages:        [String],
    frameworks:       [String],
    tools:            [String],
    domains:          [String],
    years_experience: { type: Number, default: 0 },
    top_skill:        { type: String }
  },

  github_data: {
    verified:          { type: Boolean, default: false },
    top_languages:     [{ language: String, percentage: Number }],
    total_repos:       { type: Number, default: 0 },
    total_stars:       { type: Number, default: 0 },
    account_age_years: { type: Number, default: 0 },
    activity_score:    { type: Number, default: 0 },
    fetched_at:        { type: Date }
  },

  test_status: {
    is_started:       { type: Boolean, default: false },
    is_completed:     { type: Boolean, default: false },
    start_time:       { type: Date },
    end_time:         { type: Date },
    refresh_count:    { type: Number, default: 0 },
    tab_switches:     { type: Number, default: 0 },
    difficulty_level: { type: Number, default: 1, min: 1, max: 3 },
    attempts:         { type: Number, default: 0 }
  },

  micro_test: {
    question_id:        { type: String },
    language:           { type: String },
    buggy_code:         { type: String },
    correct_fix:        { type: String },
    candidate_answer:   { type: String },
    time_taken_seconds: { type: Number },
    is_correct:         { type: Boolean }
  },

  final_scores: {
    semantic_match_score: { type: Number, default: 0 },
    github_trust_score:   { type: Number, default: 0 },
    micro_test_score:     { type: Number, default: 0 },
    experience_score:     { type: Number, default: 0 },
    activity_score:       { type: Number, default: 0 },
    overall_rank_score:   { type: Number, default: 0 }
  },

  skill_radar: {
    claimed:  { type: Object, default: {} },
    verified: { type: Object, default: {} }
  },

  applied_job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  rank:           { type: Number },
  status: {
    type:    String,
    enum:    ['applied', 'screening', 'shortlisted', 'rejected', 'hired'],
    default: 'applied'
  },

  // AI Explanation
  ai_explanation:           { type: String },
  explanation_generated_at: { type: Date }

}, { timestamps: true });

candidateSchema.index({ 'final_scores.overall_rank_score': -1 });
candidateSchema.index({ applied_job_id: 1 });

export default mongoose.model('Candidate', candidateSchema);