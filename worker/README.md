# PDF Renderer Worker (Cloudflare)

Cloudflare Worker that generates PDFs from resume data using Browser Rendering API.

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Login to Cloudflare**:
   ```bash
   npx wrangler login
   ```

3. **Set secrets**:
   ```bash
   npx wrangler secret put PDF_RENDERER_TOKEN
   # Enter a secure random token
   ```

4. **Enable Browser Rendering** (in Cloudflare Dashboard):
   - Go to Workers & Pages
   - Select your worker
   - Settings → Bindings → Add binding
   - Type: Browser Rendering
   - Variable name: BROWSER

## Development

```bash
npm run dev
```

Worker runs at: `http://localhost:8787`

## Deploy

```bash
npm run deploy
```

## API

### POST /render/pdf

**Request**:
```json
{
  "templateSlug": "education-first",
  "resumeData": { ... },
  "watermark": true
}
```

**Response**: PDF bytes (application/pdf)

**Headers**:
- `Authorization: Bearer YOUR_TOKEN`

## Testing

```bash
curl -X POST http://localhost:8787/render/pdf \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "templateSlug": "education-first",
    "resumeData": {...},
    "watermark": true
  }' \
  --output test.pdf
```

## Notes

- Browser Rendering API is a Cloudflare paid add-on
- Rate limiting recommended for production
- PDF generation takes ~2-5 seconds per request
