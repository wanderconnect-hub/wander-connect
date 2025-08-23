

export interface User {
  id: number;
  name: string;
  email?: string;
  avatarUrl: string;
  coverPhotoUrl?: string;
  bio: string;
  travelStyle: string[];
  interests: string[];
  miles?: number;
  placesCount?: number;
  trips?: number;
  partners?: number;
  profileComplete?: boolean;
}

export interface Comment {
  id: number;
  user: User;
  text: string;
  timestamp: string;
}

export interface Post {
  id: number;
  user: User;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  caption: string;
  location: string;
  timestamp: string;
  comments: Comment[];
  likedByUserIds: number[];
}

export interface TravelPreferences {
    destination: string;
    travelStyle: string[];
    interests: string[];
    bio: string;
}

export interface MatchResult {
    userId: number;
    userName: string;
    avatarUrl: string;
    compatibilityScore: number;
    reason: string;
}

export interface DestinationInfo {
    destinationName: string;
    summary: string;
    keyAttractions: string[];
    culturalTips: string[];
    bestTimeToVisit: string;
}

export interface TravelPartnerRequest {
  user: User;
  tripDescription: string;
  imageUrl: string;
}