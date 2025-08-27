// File: /api/users.js
import { sql } from '@vercel/postgres';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured on the server.");
    }
    jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  if (req.method === 'GET') {
    try {
      const { rows } = await sql`SELECT * FROM users;`;

      // Map DB rows to the expected User contract, providing safe defaults
      // This makes the API resilient to schema changes (e.g., missing columns)
      const formattedUsers = rows.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        bio: user.bio || '',
        travelStyle: user.travel_style || [],
        interests: user.interests || [],
        coverPhotoUrl: user.cover_photo_url || null,
        avatarUrl: user.avatar_url || `https://api.dicebear.com/8.x/adventurer/svg?seed=${user.name}`,
        followingIds: user.following_ids || [],
        followerIds: user.follower_ids || [],
        followRequestIds: user.follow_request_ids || [],
        miles: user.miles || 0,
        partners: user.partners || 0,
        placesCount: user.places_count || 0,
        trips: user.trips || 0,
        profileComplete: user.profile_complete ?? true,
      }));

      return res.status(200).json(formattedUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
      return res.status(500).json({ error: 'Failed to fetch users.', details: error.message });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}