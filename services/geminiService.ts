// File: services/geminiService.ts - FINAL CORRECTED & SECURE VERSION
import type { DestinationInfo, User, MatchResult, MatchmakingPreferences } from '../types';
import { fetchWithAuth } from './apiService';

//
// FUNCTION 1: For the Destination Explorer page
// This function now securely calls your /api/generate serverless function.
//
export async function getDestinationInfo(destinationName: string): Promise<DestinationInfo> {
    const prompt = `Provide a travel guide for ${destinationName}. Respond in JSON format with the fields: destinationName (string), summary (string), keyAttractions (array of strings), culturalTips (array of strings), and bestTimeToVisit (string).`;

    const response = await fetchWithAuth('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Gracefully handle non-json responses
        throw new Error(errorData.error?.message || 'Failed to fetch destination info from the server.');
    }

    const data = await response.json();

    try {
        const jsonText = data.text.trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse destination info JSON:", e, data.text);
        throw new Error('AI returned invalid format for destination.');
    }
}

//
// FUNCTION 2: For the AI-powered Itinerary Generator
// This will return a plain text 3-day plan.
//
export async function getItinerary(destinationName: string): Promise<string> {
    const prompt = `Create a detailed 3-day travel itinerary for ${destinationName}. 
Each day should include morning, afternoon, and evening activities. 
Keep it concise but inspiring, and format it as plain text with line breaks.`;

    const response = await fetchWithAuth('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to fetch itinerary from the server.');
    }

    const data = await response.json();

    try {
        // Return raw text instead of JSON parsing
        return data.text.trim();
    } catch (e) {
        console.error("Failed to parse itinerary text:", e, data.text);
        throw new Error('AI returned invalid itinerary format.');
    }
}

//
// FUNCTION 3: For the Matchmaking form
// This function now securely calls your /api/findMatches serverless function.
//
export async function findTravelMatches(
  currentUser: User, 
  allUsers: User[],
  preferences: MatchmakingPreferences
): Promise<MatchResult[]> {
  const otherUsers = allUsers.filter(u => u.id !== currentUser.id);
  
  const prompt = `
    You are a travel matchmaking AI. Based on a user's request, find the top 3 most compatible travel partners from a list of potential users.
    
    Current User's Profile:
    - Name: ${currentUser.name}
    - Bio: ${currentUser.bio}
    - Travel Style: ${currentUser.travelStyle.join(', ')}
    - Interests: ${currentUser.interests.join(', ')}

    Current User's Trip Request:
    - Destination: ${preferences.destination}
    - Desired Travel Style: ${preferences.travelStyle.join(', ')}
    - Desired Interests: ${preferences.interests.join(', ')}
    - Trip Description & Partner Preferences: ${preferences.bio}

    List of Potential Users (JSON format):
    ${JSON.stringify(otherUsers.map(u => ({ id: u.id, name: u.name, bio: u.bio, travelStyle: u.travelStyle, interests: u.interests })), null, 2)}

    Analyze the profiles and the request. Provide a compatibility score (1-100) and a brief, insightful reason for each of the top 3 matches. Respond in JSON format: an array of objects, each with userId (number), compatibilityScore (number), and reason (string).
  `;
  
  const response = await fetchWithAuth('/api/findMatches', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to fetch matches from the server.');
  }
  
  const data = await response.json();

  try {
    const jsonText = data.text.trim();
    const results = JSON.parse(jsonText);
    
    return results.map((r: any) => ({
        ...r,
        userId: Number(r.userId),
        userName: allUsers.find(u => u.id === Number(r.userId))?.name || 'Unknown User',
        avatarUrl: allUsers.find(u => u.id === Number(r.userId))?.avatarUrl || ''
    }));
  } catch (e) {
    console.error("Failed to parse matchmaking results:", e, data.text);
    throw new Error('AI returned invalid format for matches.');
  }
}
