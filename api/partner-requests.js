import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Fetch all partner requests with status 'pending'
      const result = await sql`
        SELECT id, sender_id, recipient_id, trip_description, image_url, status
        FROM partner_requests
        WHERE status = 'pending'
        ORDER BY created_at DESC;
      `;
      return res.status(200).json(result.rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  else if (req.method === 'POST') {
    const { senderId, recipientId, tripDescription, imageUrl } = req.body;
    if (!senderId || !recipientId || !tripDescription) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
      await sql`
        INSERT INTO partner_requests (sender_id, recipient_id, trip_description, image_url, status)
        VALUES (${senderId}, ${recipientId}, ${tripDescription}, ${imageUrl || null}, 'pending');
      `;
      return res.status(201).json({ message: 'Partner request sent!' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  else if (req.method === 'PATCH') {
    const { requestId, action } = req.body;

    if (!requestId || !['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    try {
      const result = await sql`
        UPDATE partner_requests
        SET status = ${action}
        WHERE id = ${requestId}
        RETURNING *;
      `;

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Request not found' });
      }

      return res.status(200).json({ success: true, request: result.rows[0] });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
