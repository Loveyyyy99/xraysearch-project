# XRaySearch — Frontend (Next.js)

Semantic chest X-ray retrieval interface. Deployed on Vercel.

## Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Google Material Symbols** (icons)

## Local Development

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local: set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

1. Push this repo to GitHub
2. Import at vercel.com → New Project
3. Framework: Next.js (auto-detected)
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = your Render/Railway backend URL
5. Deploy

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/dashboard` | Search interface (upload + filter + results) |
| `/login` | Login form |
| `/signup` | Signup form |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | FastAPI backend URL (e.g. `https://xraysearch-api.onrender.com`) |
