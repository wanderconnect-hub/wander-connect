import { sql } from '@vercel/postgres';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req) => {
  if (!JWT_SECRET) return null;
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;

  try {
    return jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
  } catch {
    return null;
  }
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Temporarily bypass auth for GET to debug 500 error
      // const userPayload = verifyToken(req);
      // if (!userPayload?.userId) {
      //   return res.status(401).json({ error: 'Unauthorized' });
      // }

      const result = await sql`SELECT id, name, email, avatar_url, bio FROM users;`;
      return res.status(200).json(result.rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'PUT') {
    const userPayload = verifyToken(req);
    if (!userPayload?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const { avatarUrl } = req.body;
      if (!avatarUrl) {
        return res.status(400).json({ error: 'avatarUrl is required.' });
      }

      await sql`
        UPDATE users 
        SET avatar_url = ${avatarUrl}
        WHERE id = ${userPayload.userId};
      `;

      return res.status(200).json({ message: 'Avatar updated successfully.' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
