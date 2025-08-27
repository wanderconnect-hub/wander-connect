// File: /api/generate.js
import { GoogleGenAI } from '@google/genai';

// Ensure the API_KEY is loaded from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  try {
    const { prompt } = req.body;
    if (!prompt) { 
        return res.status(400).json({ error: { message: 'Prompt is required.' } }); 
    }
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return res.status(200).json({ text: response.text });

  } catch (error) {
    console.error('Error in /api/generate:', error);
    return res.status(500).json({ error: { message: error.message || 'An internal server error occurred.' } });
  }
};