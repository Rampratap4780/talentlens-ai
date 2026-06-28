import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import candidateRoutes from './routes/candidates.js';
import jobRoutes from './routes/jobs.js';
import testRoutes from './routes/test.js';
import githubRoutes from './routes/github.js';
import dashboardRoutes from './routes/dashboard.js';
import explainRoutes  from './routes/explain.js';
import jdparserRoutes from './routes/jdparser.js';
import authRoutes from './routes/auth.js';



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/candidates', candidateRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/test', testRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/explain', explainRoutes);
app.use('/api/jd',      jdparserRoutes);
app.use('/api/auth', authRoutes);


app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running → http://localhost:${PORT}`);
      console.log(`📋 Health check → http://localhost:${PORT}/health`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });