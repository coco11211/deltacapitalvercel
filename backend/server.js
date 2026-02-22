const express = require('express');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../'));

// Newsletter subscribers storage (never commit this file)
const SUBSCRIBERS_FILE = path.join(__dirname, 'subscribers.json');

// Ensure subscribers file exists
if (!fs.existsSync(SUBSCRIBERS_FILE)) {
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify([], null, 2));
}

// Helper: Load subscribers
function loadSubscribers() {
  const data = fs.readFileSync(SUBSCRIBERS_FILE);
  return JSON.parse(data);
}

// Helper: Save subscribers
function saveSubscribers(subscribers) {
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
}

// Helper: Send email
async function sendEmail(to, subject, htmlContent) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: to,
      subject: subject,
      html: htmlContent,
    });
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    return false;
  }
}

// Route: Subscribe
app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body;

  // Validate email
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // Load current subscribers
  const subscribers = loadSubscribers();

  // Check if already subscribed
  const exists = subscribers.some((sub) => sub.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(409).json({ error: 'Already subscribed' });
  }

  // Add new subscriber
  subscribers.push({
    email: email.toLowerCase(),
    subscribedAt: new Date().toISOString(),
  });

  // Save subscribers
  saveSubscribers(subscribers);

  // Send confirmation email
  const confirmationEmail = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { color: #111; }
        p { color: #555; line-height: 1.6; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Thank You for Subscribing</h1>
        <p>You've successfully subscribed to Delta Capital updates.</p>
        <p>We'll send you periodic updates about our research, development progress, and milestones.</p>
        <p class="footer">
          <strong>Delta Capital</strong><br>
          Building quantitative trading systems from the ground up.
        </p>
      </div>
    </body>
    </html>
  `;

  await sendEmail(email, 'Welcome to Delta Capital Updates', confirmationEmail);

  res.json({ success: true, message: 'Subscribed successfully' });
});

// Route: Newsletter (admin endpoint to send to all)
app.post('/api/newsletter', async (req, res) => {
  const { subject, content } = req.body;

  if (!subject || !content) {
    return res.status(400).json({ error: 'Subject and content required' });
  }

  const subscribers = loadSubscribers();

  if (subscribers.length === 0) {
    return res.status(400).json({ error: 'No subscribers' });
  }

  const newsletterEmail = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { color: #111; }
        p { color: #555; line-height: 1.6; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${subject}</h1>
        <p>${content.replace(/\n/g, '<br>')}</p>
        <p class="footer">
          <strong>Delta Capital</strong><br>
          Building quantitative trading systems from the ground up.
        </p>
      </div>
    </body>
    </html>
  `;

  // Send to all subscribers
  const results = [];
  for (const subscriber of subscribers) {
    const success = await sendEmail(subscriber.email, subject, newsletterEmail);
    results.push({ email: subscriber.email, success });
  }

  res.json({
    success: true,
    totalSent: results.length,
    sent: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
  });
});

// Route: Get subscriber count (admin)
app.get('/api/subscribers-count', (req, res) => {
  const subscribers = loadSubscribers();
  res.json({ count: subscribers.length });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Newsletter server running on port ${PORT}`);
  console.log('Make sure to set up environment variables in .env file');
});