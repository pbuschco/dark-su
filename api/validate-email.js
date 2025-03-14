import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // Set CORS headers for all browsers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*'); // Replace with specific origins for security if needed
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS preflight request (needed for CORS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle POST request to validate the email
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
      return res.status(400).json({ message: 'Please enter an email address' });
    }

    // Get domain from the email
    const domain = email.split('@')[1];

    // Validate email format
    if (!domain) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Read allowed domains from the file
    const filePath = path.join(process.cwd(), 'api', 'allowed_domains.json');
    console.log('Attempting to read from:', filePath);

    const fileData = await fs.promises.readFile(filePath, 'utf8');
    console.log('File contents:', fileData);

    let domains;
    try {
      domains = JSON.parse(fileData); // Parse the JSON data
    } catch (error) {
      console.error('Error parsing domains:', error);
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Check if domains is an array and if the email domain is allowed
    if (!Array.isArray(domains)) {
      console.error('Invalid domains format:', domains);
      return res.status(500).json({ message: 'Server configuration error' });
    }

    if (!domains.includes(domain.toLowerCase())) {
      return res.status(400).json({ message: 'Access Denied' });
    }

    // Successfully validated the email
    return res.status(200).json({ message: 'Email validated successfully' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ message: 'Unable to verify email. Please try again later.' });
  }
}
