// File: /api/posts.js - FIXED PRODUCTION VERSION
import { sql } from '@vercel/postgres';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req) => {
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not configured on the server.");
    return null;
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return null;
  }
};

export default async function handler(req, res) {
  try {
    const userPayload = verifyToken(req);

    // ✅ Only require login for POST/PUT/DELETE
    const requireAuth = req.method !== 'GET';
    if (requireAuth && (!userPayload || !userPayload.userId)) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or missing token.' });
    }

    if (req.method === 'GET') {
      const limit = parseInt(req.query.limit, 10) || 10;
      const page = parseInt(req.query.page, 10) || 1;
      const offset = (page - 1) * limit;

      const countResult = await sql`SELECT COUNT(*) FROM posts;`;
      const totalPosts = parseInt(countResult.rows[0].count, 10);

      const { rows: posts } = await sql`
        SELECT 
          p.id,
          p.content,
          p.media_url AS "mediaUrl",
          p.media_type AS "mediaType",
          p.created_at AS "timestamp",
          p.location,
          json_build_object(
              'id', u.id,
              'name', u.name,
              'avatarUrl', COALESCE(u.avatar_url, 'https://api.dicebear.com/8.x/adventurer/svg?seed=' || u.name)
          ) as user,
          COALESCE(
            (SELECT array_agg(l.user_id::text) FROM likes l WHERE l.post_id = p.id),
            '{}'::text[]
          ) as "likedByUserIds",
          COALESCE(
            (
              SELECT json_agg(json_build_object(
                'id', c.id,
                'text', c.text,
                'timestamp', c.created_at,
                'user', json_build_object(
                  'id', cu.id,
                  'name', cu.name,
                  'avatarUrl', COALESCE(cu.avatar_url, 'https://api.dicebear.com/8.x/adventurer/svg?seed=' || cu.name)
                )
              ) ORDER BY c.created_at ASC)
              FROM comments c
              JOIN users cu ON c.user_id = cu.id
              WHERE c.post_id = p.id
            ),
            '[]'::json
          ) as "comments"
        FROM posts p
        JOIN users u ON p.author_id = u.id
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset};
      `;

      return res.status(200).json({ 
        posts, 
        totalPages: Math.ceil(totalPosts / limit),
        currentPage: page
      });
    }

    if (req.method === 'POST') {
      const { content, mediaUrl, mediaType } = req.body;
      if (!content && !mediaUrl) {
        return res.status(400).json({ error: 'Post must have content or media.' });
      }

      await sql`
        INSERT INTO posts (content, author_id, media_url, media_type) 
        VALUES (${content || null}, ${userPayload.userId}, ${mediaUrl || null}, ${mediaType || null});
      `;

      return res.status(201).json({ message: 'Post created successfully.' });
    }

    if (req.method === 'PUT') {
      const { id, content } = req.body;
      if (id === undefined) {
        return res.status(400).json({ error: 'Post ID is required.' });
      }

      const result = await sql`
        UPDATE posts SET content = ${content} 
        WHERE id = ${id} AND author_id = ${userPayload.userId};
      `;

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Post not found or not authorized to edit.' });
      }

      return res.status(200).json({ message: 'Post updated successfully.' });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Post ID is required.' });
      }

      const result = await sql`
        DELETE FROM posts WHERE id = ${id} AND author_id = ${userPayload.userId};
      `;

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Post not found or not authorized to delete.' });
      }

      return res.status(200).json({ message: 'Post deleted successfully.' });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    // ✅ Better error logging
    console.error("Error in /api/posts:", error);
    return res.status(500).json({ error: error.message, stack: error.stack });
  }
}
