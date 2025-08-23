
import { GoogleGenAI, Type } from "@google/genai";
import type { TravelPreferences, MatchResult, DestinationInfo, User } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a client-side check. In a real app, the environment variable is set on the server or build environment.
  // For this project, we'll proceed and let the API calls fail if the key is missing,
  // but a user-friendly message would be ideal.
  console.warn("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const findTravelMatches = async (preferences: TravelPreferences, currentUser: User, allUsers: User[]): Promise<MatchResult[]> => {
  const otherTravelers = allUsers.filter(u => u.id !== currentUser.id);

  const prompt = `
    You are a sophisticated travel matchmaking AI. Your goal is to find the best travel companions for a user based on their preferences.
    
    The user's preferences are:
    - Destination: ${preferences.destination}
    - Travel Style: ${preferences.travelStyle.join(', ')}
    - Interests: ${preferences.interests.join(', ')}
    - Bio: "${preferences.bio}"

    Here is a list of available travelers:
    ${JSON.stringify(otherTravelers, null, 2)}

    Analyze the user's preferences and compare them against each available traveler.
    Return a ranked list of the top 3 most compatible travelers.
    For each match, provide a compatibility score from 0 to 100 and a brief, compelling reason for why they are a good match.
    Focus on shared interests, compatible travel styles, and potential for a harmonious trip.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              userId: { type: Type.NUMBER },
              userName: { type: Type.STRING },
              avatarUrl: { type: Type.STRING },
              compatibilityScore: { type: Type.NUMBER },
              reason: { type: Type.STRING },
            },
            required: ["userId", "userName", "avatarUrl", "compatibilityScore", "reason"],
          },
        },
      },
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as MatchResult[];

  } catch (error) {
    console.error("Error finding travel matches:", error);
    throw new Error("Failed to connect with the AI matchmaking service. Please try again.");
  }
};


export const getDestinationInfo = async (destinationName: string): Promise<DestinationInfo> => {
    const prompt = `
      You are a world-class travel guide AI. Provide a concise yet comprehensive travel guide for the following destination: ${destinationName}.
      
      Your response should include:
      1. A brief, engaging summary of the destination.
      2. A list of 3-5 key attractions that a first-time visitor must see.
      3. A list of 2-3 important cultural tips to be aware of.
      4. A recommendation for the best time of year to visit.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              destinationName: { type: Type.STRING },
              summary: { type: Type.STRING },
              keyAttractions: { type: Type.ARRAY, items: { type: Type.STRING } },
              culturalTips: { type: Type.ARRAY, items: { type: Type.STRING } },
              bestTimeToVisit: { type: Type.STRING },
            },
            required: ["destinationName", "summary", "keyAttractions", "culturalTips", "bestTimeToVisit"],
          },
        },
      });
  
      const jsonString = response.text.trim();
      return JSON.parse(jsonString) as DestinationInfo;
  
    } catch (error) {
      console.error("Error getting destination info:", error);
      throw new Error("Failed to fetch information for this destination. Please check the name and try again.");
    }
  };
