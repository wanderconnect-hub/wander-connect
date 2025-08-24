// File: /api/api/generate.js
// Note the double "api" in the path, matching your project structure.

import { GoogleGenerativeAI } from '@google/generative-ai';

// IMPORTANT: Make sure your API key is set as an environment variable in Vercel.
// Go to Project Settings > Environment Variables and add GOOGLE_API_KEY.
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export default async function handler(req, res) {
  // We only want to handle POST requests.
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: { message: 'Prompt is required.' } });
    }
    
    // This is the Gemini logic, now running safely on the server.
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    // Send the AI's response back to the frontend.
    return res.status(200).json({ text });

  } catch (error) {
    console.error('Error generating content:', error);
    // Send a generic server error response.
    return res.status(500).json({ 
      error: { message: error.message || 'An internal server error occurred.' } 
    });
  }
}
```**Important:** Your serverless function will be available at the URL `/api/api/generate` because of your folder structure. We need to remember this for the next step.

---

### **Step 2: Update Your `geminiService` File**

Now we will change the code that calls the AI from the frontend.

1.  Go to your services folder and open the file `src/services/geminiService.js` (or `.ts`).
2.  **Delete everything** inside that file.
3.  Replace it with this new code, which now calls your new API route:

```javascript
// src/services/geminiService.js

/**
 * This function now calls our own secure API route (/api/api/generate)
 * instead of calling Google's API directly from the browser.
 */
export async function getDestinationInfo(destinationName) {
  const prompt = `
    Provide a travel guide for ${destinationName}. 
    Return the response as a valid JSON object with the following structure:
    {
      "destinationName": "Name of the Destination",
      "summary": "A brief, engaging summary (2-3 sentences).",
      "keyAttractions": ["Attraction 1", "Attraction 2", "Attraction 3"],
      "culturalTips": ["Tip 1", "Tip 2", "Tip 3"],
      "bestTimeToVisit": "Describe the best season or months to visit."
    }
    Do not include any introductory text, markdown formatting like \`\`\`json, or any trailing text.
    The output must be only the JSON object.
  `;

  // Call our own backend API. Note the path /api/api/generate
  const res = await fetch('/api/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message || 'Failed to get data from the AI.');
  }

  // The server now sends back a { text: "..." } object.
  // We need to parse the JSON string from the 'text' property.
  try {
    return JSON.parse(data.text);
  } catch (parseError) {
    console.error('Failed to parse AI response:', data.text);
    throw new Error('The AI returned an invalid format.');
  }
}