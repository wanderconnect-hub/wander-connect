// File: /api/posts.js

// Use 'import' instead of 'require'
import { sql } from '@vercel/postgres';

// Use 'export default' to make the function discoverable by Vercel
export default async function handler(req, res) {
  // --- GET all posts ---
  if (req.method === 'GET') {
    try {
      // This query assumes your table has 'author_name', 'content', and 'created_at'
      const { rows: posts } = await sql`SELECT * FROM posts ORDER BY created_at DESC;`;
      
      const formattedPosts = posts.map(p => ({
        id: p.id,
        user: { name: p.author_name, avatarUrl: `https://api.dicebear.com/8.x/adventurer/svg?seed=${p.author_name}` },
        content: p.content,
        timestamp: p.created_at,
        likedByUserIds: [],
        comments: [],
      }));
      return res.status(200).json(formattedPosts);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- SAVE a new post ---
  if (req.method === 'POST') {
    try {
      const { content, author_name } = req.body;
      if (!content || !author_name) { 
        return res.status(400).json({ error: 'Content and author name are required.' }); 
      }
      
      // This query assumes your table has 'content' and 'author_name' columns
      await sql`INSERT INTO posts (content, author_name) VALUES (${content}, ${author_name});`;
      
      return res.status(201).json({ message: 'Post created successfully.' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // If the method is not GET or POST, return an error
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
};