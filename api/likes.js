// File: /api/likes.js
import { sql } from '@vercel/postgres';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req) => {
  if (!JWT_SECRET) return null;
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export default async function handler(req, res) {
  const userPayload = verifyToken(req);
  if (!userPayload || !userPayload.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const userId = userPayload.userId;

  if (req.method === 'POST') {
    try {
      const { postId } = req.body;
      if (postId === undefined) {
        return res.status(400).json({ error: 'Post ID is required.' });
      }

      // Check if the user has already liked the post
      const { rows } = await sql`
        SELECT id FROM likes WHERE user_id = ${userId} AND post_id = ${postId};
      `;

      if (rows.length > 0) {
        // User has liked it, so unlike it
        await sql`
          DELETE FROM likes WHERE user_id = ${userId} AND post_id = ${postId};
        `;
        return res.status(200).json({ message: 'Post unliked successfully.' });
      } else {
        // User has not liked it, so like it
        await sql`
          INSERT INTO likes (user_id, post_id) VALUES (${userId}, ${postId});
        `;
        return res.status(201).json({ message: 'Post liked successfully.' });
      }
    } catch (error) {
      console.error('Error in /api/likes:', error);
      return res.status(500).json({ error: 'Failed to toggle like.', details: error.message });
    }
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
