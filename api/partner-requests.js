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
      const result = await sql`
        SELECT id, sender_id, recipient_id, trip_description, image_url, status, created_at
        FROM partner_requests
        WHERE status = 'pending'
        ORDER BY created_at DESC;
      `;
      return res.status(200).json({ success: true, data: result.rows });
    }

    if (req.method === 'POST') {
      const userPayload = verifyToken(req);
      if (!userPayload?.userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { senderId, recipientId, tripDescription, imageUrl, requestId, action } = req.body;

      // --- Respond to request (accept/reject) ---
      if (requestId && action) {
        if (!['accept', 'reject'].includes(action)) {
          return res.status(400).json({ success: false, error: 'Invalid action' });
        }

        const newStatus = action === 'accept' ? 'accepted' : 'rejected';

        await sql`
          UPDATE partner_requests
          SET status = ${newStatus}
          WHERE id = ${requestId};
        `;

        return res.status(200).json({ success: true, message: `Request ${action}ed successfully` });
      }

      // --- Create new request ---
      if (!senderId || !recipientId || !tripDescription) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      await sql`
        INSERT INTO partner_requests (sender_id, recipient_id, trip_description, image_url, status)
        VALUES (${senderId}, ${recipientId}, ${tripDescription}, ${imageUrl || null}, 'pending');
      `;

      return res.status(201).json({ success: true, message: 'Partner request sent!' });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error('Error in /api/partner-requests:', error);
    return res.status(500).json({ success: false, error: 'Unexpected server error.' });
  }
}
