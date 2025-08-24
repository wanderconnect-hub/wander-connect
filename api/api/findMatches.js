// File: /api/api/findMatches.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// This uses the SAME environment variable as our other function.
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: { message: 'Prompt is required for matching.' } });
    }
    
    // This is the Gemini logic, running safely on the server.
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    // Send the AI's response back to the frontend.
    return res.status(200).json({ text });

  } catch (error) {
    console.error('Error finding matches:', error);
    return res.status(500).json({ 
      error: { message: error.message || 'An internal server error occurred.' } 
    });
  }
}