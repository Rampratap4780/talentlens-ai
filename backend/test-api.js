import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

console.log('=== EMBEDDING TEST ===');
try {
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
  const result = await model.embedContent('hello world test');
  console.log('✅ Embedding works! Vector length:', result.embedding.values.length);
} catch (e) {
  console.log('❌ Failed:', e.message);
}