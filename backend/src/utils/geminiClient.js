import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateText(prompt, systemInstruction = '') {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      ...(systemInstruction && { systemInstruction })
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini generateText error:', error.message);
    throw new Error('AI generation failed: ' + error.message);
  }
}

export async function generateEmbedding(text) {
  try {
   const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Gemini embedding error:', error.message);
    throw new Error('Embedding generation failed: ' + error.message);
  }
}

export async function generateJSON(prompt) {
  try {
    const raw = await generateText(prompt);
    const cleaned = raw
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Gemini generateJSON error:', error.message);
    throw new Error('JSON generation failed: ' + error.message);
  }
}

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));