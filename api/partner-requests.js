import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // --- GET: fetch all pending partner requests ---
  if (req.method === 'GET') {
    try {
      const result = await sql`
        SELECT id, sender_id, recipient_id, trip_description, image_url
        FROM partner_requests
        WHERE status = 'pending'
        ORDER BY created_at DESC;
      `;
      return res.status(200).json(result.rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- POST: create a new partner request OR respond ---
  else if (req.method === 'POST') {
    const { senderId, recipientId, tripDescription, imageUrl, requestId, action } = req.body;

    try {
      // --- CASE 1: Respond to a request (accept/reject) ---
      if (requestId && action) {
        if (!['accept', 'reject'].includes(action)) {
          return res.status(400).json({ error: 'Invalid action' });
        }

        const newStatus = action === 'accept' ? 'accepted' : 'rejected';
        await sql`
          UPDATE partner_requests
          SET status = ${newStatus}
          WHERE id = ${requestId};
        `;

        return res.status(200).json({ message: `Request ${action}ed successfully` });
      }

      // --- CASE 2: Create a new request ---
      if (!senderId || !recipientId || !tripDescription) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await sql`
        INSERT INTO partner_requests (sender_id, recipient_id, trip_description, image_url, status)
        VALUES (${senderId}, ${recipientId}, ${tripDescription}, ${imageUrl || null}, 'pending');
      `;

      return res.status(201).json({ message: 'Partner request sent!' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- Unsupported methods ---
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
