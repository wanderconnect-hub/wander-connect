import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { requestId, action } = req.body; // action = 'accept' or 'reject'
    if (!requestId || !['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid request parameters' });
    }

    try {
      // Fetch sender and recipient ids for the request
      const result = await sql`SELECT sender_id, recipient_id FROM partner_requests WHERE id = ${requestId};`;
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Request not found' });
      }
      const { sender_id, recipient_id } = result.rows[0];

      if (action === 'accept') {
        // Update request status
        await sql`UPDATE partner_requests SET status = 'accepted' WHERE id = ${requestId};`;

        // Add bidirectional buddy connections
        await sql`INSERT INTO connections (user_id, buddy_id) VALUES (${sender_id}, ${recipient_id});`;
        await sql`INSERT INTO connections (user_id, buddy_id) VALUES (${recipient_id}, ${sender_id});`;

        return res.status(200).json({ message: 'Partner request accepted and buddies connected' });
      } else {
        // Reject request
        await sql`UPDATE partner_requests SET status = 'rejected' WHERE id = ${requestId};`;
        return res.status(200).json({ message: 'Partner request rejected' });
      }

    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
