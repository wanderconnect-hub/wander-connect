// File: /api/findMatches.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  try {
    const { prompt } = req.body;
    if (!prompt) { return res.status(400).json({ error: { message: 'Prompt is required for matching.' } }); }
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    return res.status(200).json({ text });
  } catch (error) {
    return res.status(500).json({ error: { message: error.message || 'An internal server error occurred.' } });
  }
};