// File: /api/upload.js
import { put } from '@vercel/blob';

export default async function handler(req, res) {
  // This function only accepts POST requests for file uploads
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // The filename is passed as a query parameter in the URL
  const { filename } = req.query;

  if (!filename) {
    return res.status(400).json({ message: 'Missing "filename" query parameter.' });
  }

  try {
    // The `req` object is a stream of the file data.
    // The `put` function from @vercel/blob handles this stream directly.
    // It reads the BLOB_READ_WRITE_TOKEN from your project's environment variables automatically.
    const blob = await put(filename, req, {
      access: 'public',
    });

    // If the upload is successful, send back the blob's details (including the URL)
    return res.status(200).json(blob);

  } catch (error) {
    // If the upload fails (e.g., token is missing), this block will run
    console.error('CRITICAL ERROR in /api/upload:', error);
    return res.status(500).json({ 
        message: `Server error during upload: ${error.message}` 
    });
  }
};