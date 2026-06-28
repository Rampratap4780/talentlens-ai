import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title:               { type: String, required: true },
  company:             { type: String, required: true },
  description:         { type: String, required: true },
  required_skills:     [String],
  preferred_skills:    [String],
  experience_required: { type: Number, default: 0 },
  location:            { type: String },
  job_type: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    default: 'full-time'
  },
  description_vector: { type: [Number], default: [] },
  is_active:          { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Job', jobSchema);