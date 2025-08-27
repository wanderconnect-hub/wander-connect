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
    jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  if (req.method === 'GET') {
    try {
      const { rows } = await sql`
        SELECT 
          id, 
          name, 
          email,
          bio,
          travel_style AS "travelStyle",
          interests,
          cover_photo_url AS "coverPhotoUrl",
          COALESCE(avatar_url, 'https://api.dicebear.com/8.x/adventurer/svg?seed=' || name) as "avatarUrl",
          -- Cast following/follower arrays to integer arrays
          COALESCE(following_ids, '{}'::int[]) AS "followingIds",
          COALESCE(follower_ids, '{}'::int[]) AS "followerIds",
          COALESCE(follow_request_ids, '{}'::int[]) AS "followRequestIds"
        FROM users;
      `;
      return res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching users:', error);
      return res.status(500).json({ error: 'Failed to fetch users.', details: error.message });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
