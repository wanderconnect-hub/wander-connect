// pages/api/connections.js
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // ✅ Count accepted buddies for a user (as recipient or sender)
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }
    try {
      const result = await sql`
        SELECT COUNT(*) 
        FROM partner_requests
        WHERE (sender_id = ${userId} OR recipient_id = ${userId})
        AND status = 'accepted';
      `;
      return res.status(200).json({ buddiesCount: parseInt(result.rows[0].count, 10) });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    // ✅ Accept a partner request
    const { requestId } = req.body; // requestId = row id in partner_requests
    if (!requestId) {
      return res.status(400).json({ error: 'Missing requestId parameter' });
    }
    try {
      await sql`
        UPDATE partner_requests
        SET status = 'accepted'
        WHERE id = ${requestId};
      `;
      return res.status(200).json({ message: 'Connection accepted successfully' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ❌ Invalid method
  res.setHeader('Allow', 'GET, POST');
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
