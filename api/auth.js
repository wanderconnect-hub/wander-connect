// File: /api/auth.js
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// IMPORTANT: Add a JWT_SECRET to your Vercel Environment Variables!
// It can be any long, random string.
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  const { action, email, password, name } = req.body;

  if (!JWT_SECRET) {
    return res.status(500).json({ error: 'JWT_SECRET is not configured on the server.' });
  }

  // --- REGISTER A NEW USER ---
  if (action === 'register') {
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    try {
      const password_hash = await bcrypt.hash(password, 10); // Hash the password
      await sql`
        INSERT INTO users (email, password_hash, name)
        VALUES (${email}, ${password_hash}, ${name});
      `;
      return res.status(201).json({ message: 'User created successfully.' });
    } catch (error) {
      // Check for unique email error (code 23505 in Postgres)
      if (error.code === '23505') {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }
      return res.status(500).json({ error: 'Failed to create user.', details: error.message });
    }
  }

  // --- LOG IN A USER ---
  if (action === 'login') {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    try {
      const { rows } = await sql`SELECT * FROM users WHERE email = ${email};`;
      const user = rows[0];
      if (!user) {
        return res.status(404).json({ error: 'Invalid credentials.' });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(404).json({ error: 'Invalid credentials.' });
      }
      // Create a token that proves the user is logged in
      const token = jwt.sign({ userId: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
      return res.status(200).json({ token });
    } catch (error) {
      return res.status(500).json({ error: 'Login failed.', details: error.message });
    }
  }

  return res.status(400).json({ error: 'Invalid action.' });
}