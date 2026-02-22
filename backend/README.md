# Delta Capital Newsletter Backend

Secure, custom newsletter backend for Delta Capital.

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure email (Create a `.env` file):**
   Copy `.env.example` to `.env` and fill in your SMTP credentials:
   ```bash
   cp .env.example .env
   ```

   **Recommended email providers:**
   - **SendGrid** (easiest for small teams)
   - **AWS SES** (cheapest, requires AWS account)
   - **Gmail SMTP** (free, but rate-limited)

3. **Start the server:**
   ```bash
   npm start
   ```

   Server runs on port 3000 by default.

4. **Subscribe:**
   Visitors can subscribe at `/newsletter.html`

5. **Send newsletter:**
   Send a POST request to `/api/newsletter`:
   ```bash
   curl -X POST http://localhost:3000/api/newsletter \
     -H "Content-Type: application/json" \
     -d '{"subject": "Research Update", "content": "We made progress on X..." }'
   ```

## Security

- `.env` file is in `.gitignore` — never commit secrets
- `subscribers.json` is in `.gitignore` — never commit email list
- Emails are only sent via your configured SMTP provider
- All inputs are validated before processing

## Environment Variables

- `SMTP_HOST` — Email server host
- `SMTP_PORT` — Email server port (587 for TLS, 465 for SSL)
- `SMTP_USER` — Your email username
- `SMTP_PASS` — Your email password or API key
- `EMAIL_FROM` — Default sender address (optional)
- `NEWSLETTER_FROM_NAME` — Default sender name (optional)
- `PORT` — Server port (default: 3000)

## Files

- `server.js` — Main server code
- `package.json` — Node.js dependencies
- `.env` — Environment variables (create from `.env.example`)
- `subscribers.json` — Email list (auto-created, never committed)