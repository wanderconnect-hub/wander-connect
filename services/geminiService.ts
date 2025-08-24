// File: services/geminiService.ts - FINAL CORRECTED VERSION
import type { DestinationInfo, User, MatchResult, TravelPartnerRequest } from '../types';

//
// FUNCTION 1: For the Destination Explorer page
// This calls your /api/api/generate serverless function.
//
export async function getDestinationInfo(destinationName: string): Promise<DestinationInfo> {
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

  const res = await fetch('/api/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || 'Failed to get destination info.');
  }

  try {
    return JSON.parse(data.text);
  } catch (e) {
    throw new Error('AI returned invalid format for destination.');
  }
}


//
// FUNCTION 2: For the Matchmaking form
// This calls your /api/api/findMatches serverless function.
//
export async function findTravelMatches(
  currentUser: User, 
  allUsers: User[],
  request: TravelPartnerRequest
): Promise<MatchResult[]> {
  const otherUsers = allUsers.filter(u => u.id !== currentUser.id);
  const prompt = `
    You are a travel matchmaking AI. Based on a user's request, find the top 3 most compatible travel partners from a list of potential users.
    
    Current User's Profile:
    - Name: ${currentUser.name}
    - Bio: ${currentUser.bio}
    - Travel Style: ${currentUser.travelStyle.join(', ')}
    - Interests: ${currentUser.interests.join(', ')}

    Current User's Request:
    - Destination: ${request.destination}
    - Dates: ${request.dates}
    - Desired Partner Traits: ${request.partnerPreferences}

    List of Potential Users (JSON format):
    ${JSON.stringify(otherUsers.map(u => ({ id: u.id, name: u.name, bio: u.bio, travelStyle: u.travelStyle, interests: u.interests })), null, 2)}

    Analyze the profiles and the request. Provide a compatibility score (1-100) and a brief reason for each of the top 3 matches.
    Return the response as a single, valid JSON array with the following structure:
    [
      { "userId": "<ID of matched user>", "compatibilityScore": <number>, "reason": "<string>" },
      { "userId": "<ID of matched user>", "compatibilityScore": <number>, "reason": "<string>" },
      { "userId": "<ID of matched user>", "compatibilityScore": <number>, "reason": "<string>" }
    ]
    Only output the JSON array. Do not include any other text or markdown.
  `;

  const res = await fetch('/api/api/findMatches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || 'Failed to get matches.');
  }

  try {
    return JSON.parse(data.text);
  } catch (e) {
    throw new Error('AI returned invalid format for matches.');
  }
}