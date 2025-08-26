// File: /api/posts.js - FINAL CORRECTED VERSION

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // --- GET all posts ---
  if (req.method === 'GET') {
    try {
      const { rows: posts } = await sql`SELECT * FROM posts ORDER BY created_at DESC;`;
      const formattedPosts = posts.map(p => ({
        id: p.id,
        user: { name: p.author_name, avatarUrl: `https://api.dicebear.com/8.x/adventurer/svg?seed=${p.author_name}` },
        content: p.content,
        timestamp: p.created_at,
        mediaUrl: p.media_url,
        mediaType: p.media_type,
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
      const { content, author_name, mediaUrl, mediaType } = req.body;

      // --- NEW VALIDATION LOGIC ---
      // A post is invalid if there is no author, OR if there is NEITHER text content NOR a media URL.
      if (!author_name || (!content && !mediaUrl)) {
        return res.status(400).json({ error: 'A post must have text content or an image/video.' });
      }
      
      // The INSERT query is now safe because the 'content' column can be null.
      await sql`
        INSERT INTO posts (content, author_name, media_url, media_type) 
        VALUES (${content || null}, ${author_name}, ${mediaUrl || null}, ${mediaType || null});
      `;
      
      return res.status(201).json({ message: 'Post created successfully.' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
};