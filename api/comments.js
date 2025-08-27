// File: /api/comments.js
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
      const { postId, text } = req.body;
      if (postId === undefined || !text || text.trim() === '') {
        return res.status(400).json({ error: 'Post ID and comment text are required.' });
      }

      const result = await sql`
        INSERT INTO comments (user_id, post_id, text) 
        VALUES (${userId}, ${postId}, ${text})
        RETURNING id, created_at;
      `;
      
      const newCommentInfo = result.rows[0];
      
      const { rows: userRows } = await sql`SELECT name, avatar_url FROM users WHERE id = ${userId};`;
      const user = userRows[0];

      // Return a fully formed comment object for the client
      const newComment = {
          id: newCommentInfo.id,
          text,
          timestamp: newCommentInfo.created_at,
          user: {
              id: userPayload.userId,
              name: user.name,
              avatarUrl: user.avatar_url || `https://api.dicebear.com/8.x/adventurer/svg?seed=${user.name}`
          }
      };
      
      return res.status(201).json(newComment);

    } catch (error) {
      console.error('Error in /api/comments:', error);
      return res.status(500).json({ error: 'Failed to post comment.', details: error.message });
    }
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
