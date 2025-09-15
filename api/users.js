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
  try {
    if (req.method === 'GET') {
      const result = await sql`SELECT id, name, email, avatar_url FROM users;`;
      return res.status(200).json({ success: true, data: result.rows });
    }

    if (req.method === 'PUT') {
      const userPayload = verifyToken(req);
      if (!userPayload?.userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { avatarUrl } = req.body;
      if (!avatarUrl) {
        return res.status(400).json({ success: false, error: 'avatarUrl is required.' });
      }

      await sql`
        UPDATE users SET avatar_url = ${avatarUrl}
        WHERE id = ${userPayload.userId};
      `;

      return res.status(200).json({ success: true, message: 'Avatar updated successfully.' });
    }

    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error('Error in /api/users:', error);
    return res.status(500).json({ success: false, error: 'Unexpected server error.' });
  }
}
