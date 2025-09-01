import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }
    try {
      const result = await sql`SELECT COUNT(*) FROM connections WHERE user_id = ${userId};`;
      return res.status(200).json({ buddiesCount: parseInt(result.rows[0].count, 10) });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  res.setHeader('Allow', 'GET');
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
