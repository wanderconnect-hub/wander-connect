import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ success: false, error: "Method not allowed. Use POST." });
    }

    if (!JWT_SECRET) {
      return res.status(500).json({ success: false, error: "JWT_SECRET is not configured on the server." });
    }

    const { action, email, password, name } = req.body || {};
    if (!action) {
      return res.status(400).json({ success: false, error: "Action is required." });
    }

    /// --- REGISTER ---
    if (action === "register") {
      if (!email || !password || !name) {
        return res.status(400).json({ success: false, error: "Name, email, and password are required." });
      }

      try {
        const password_hash = await bcrypt.hash(password, 10);

        const { rows } = await sql`
          INSERT INTO users (email, password_hash, name)
          VALUES (${email}, ${password_hash}, ${name})
          RETURNING id, email, name;
        `;

        const newUser = rows[0];

        const token = jwt.sign(
          { userId: newUser.id, email: newUser.email, name: newUser.name },
          JWT_SECRET,
          { expiresIn: "1d" }
        );

        return res.status(201).json({
          success: true,
          message: "User created successfully.",
          token,
          user: newUser,
        });
      } catch (error) {
        if (error.code === "23505") {
          return res.status(409).json({ success: false, error: "An account with this email already exists." });
        }
        console.error("Register error:", error);
        return res.status(500).json({ success: false, error: "Failed to create user." });
      }
    }

    // --- LOGIN ---
    if (action === "login") {
      if (!email || !password) {
        return res.status(400).json({ success: false, error: "Email and password are required." });
      }

      try {
        const { rows } = await sql`SELECT * FROM users WHERE email = ${email};`;
        const user = rows[0];

        if (!user) {
          return res.status(404).json({ success: false, error: "Invalid credentials." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
          return res.status(404).json({ success: false, error: "Invalid credentials." });
        }

        const token = jwt.sign(
          { userId: user.id, email: user.email, name: user.name },
          JWT_SECRET,
          { expiresIn: "1d" }
        );

        return res.status(200).json({
          success: true,
          token,
          user: { id: user.id, email: user.email, name: user.name },
        });
      } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ success: false, error: "Login failed." });
      }
    }

    return res.status(400).json({ success: false, error: "Invalid action." });
  } catch (err) {
    console.error("Auth API crashed:", err);
    return res.status(500).json({ success: false, error: "Unexpected server error." });
  }
}
