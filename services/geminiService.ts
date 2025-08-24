// src/services/geminiService.js

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

  // This calls your BACKEND. It does NOT use the SDK.
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

  try {
    return JSON.parse(data.text);
  } catch (parseError) {
    console.error('Failed to parse AI response:', data.text);
    throw new Error('The AI returned an invalid format.');
  }
}