# XRaySearch — Complete Project

Hybrid semantic chest X-ray retrieval system.
Personal project · 2025

---

## Folder Structure

```
xraysearch/           ← Next.js 16 frontend (deploy to Vercel)
xraysearch-backend/   ← FastAPI backend    (deploy to Render)
```

---

## 🚀 Deployment Guide (step by step)

### Step 1 — Get the NIH dataset

1. Go to: https://nihcc.app.box.com/v/ChestXray-NIHCC
2. Download `Data_Entry_2017.csv`
3. Download image zip files (images_001.zip through images_012.zip)
4. Extract all images into one folder: `/your/path/images/`

### Step 2 — Build the HNSW index (on GPU, run once)

Recommended: Google Colab Pro or any machine with a GPU.

```bash
cd xraysearch-backend
pip install -r requirements.txt

python build_index.py \
  --csv    /path/to/Data_Entry_2017.csv \
  --images /path/to/images/
```

This creates 3 files in `data/`:
- `hnsw_index.bin` — the vector index (~50 MB)
- `image_ids.json` — index → filename mapping
- `nih_metadata.db` — SQLite patient metadata

**Time estimate:** ~20–40 min on GPU, ~2–4 hrs on CPU for 5,606 images.

### Step 3 — (Recommended) Host images on cloud storage

Upload all NIH images to Cloudflare R2 (free 10 GB) or AWS S3:

```bash
# Example with AWS CLI
aws s3 sync /path/to/images/ s3://your-bucket/xrays/ --acl public-read
```

Set `IMAGE_BASE_URL=https://your-bucket.s3.amazonaws.com/xrays` in your backend `.env`.

### Step 4 — Deploy backend to Render

1. Push `xraysearch-backend/` to a GitHub repo
2. Go to render.com → **New Web Service** → connect your repo
3. Configure:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add a **Persistent Disk** at path `/opt/render/project/src/data` (10 GB)
5. Upload your `data/` files to the disk (via Render shell or rsync)
6. Set environment variables:
   ```
   CXR_VIT_MODEL=google/vit-base-patch16-224-in21k
   IMAGE_BASE_URL=https://your-bucket.../xrays
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```
7. Deploy → your backend URL will be `https://xraysearch-api.onrender.com`

### Step 5 — Deploy frontend to Vercel

1. Push `xraysearch/` to a GitHub repo (separate from backend)
2. Go to vercel.com → **New Project** → import your repo
3. Framework: **Next.js** (auto-detected)
4. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL = https://xraysearch-api.onrender.com
   ```
5. Deploy → your site is live at `https://your-app.vercel.app`

---

## 🔧 Local Development

### Backend
```bash
cd xraysearch-backend
pip install -r requirements.txt
cp .env.example .env          # edit as needed
uvicorn main:app --reload     # http://localhost:8000
# API docs at http://localhost:8000/docs
```

### Frontend
```bash
cd xraysearch
npm install
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev                   # http://localhost:3000
```

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Embedding | Google CXR ViT (`google/vit-base-patch16-224-in21k`) |
| Vector search | hnswlib (HNSW, cosine space) |
| Metadata filter | SQLite3 |
| Backend | FastAPI + Uvicorn |
| Frontend | Next.js 16 + TypeScript + Tailwind CSS v4 |
| Deployment | Vercel (frontend) + Render (backend) |
| Dataset | NIH ChestX-ray14 · Wang et al., 2017 · 5,606 images |

---

## 📁 Key Files

### Backend
| File | Purpose |
|------|---------|
| `main.py` | FastAPI app — `/search` and `/health` endpoints |
| `embedder.py` | CXR ViT image encoder → 768-dim vectors |
| `index.py` | hnswlib HNSW index — build, load, search |
| `database.py` | SQLite metadata — build schema, pre-filter queries |
| `build_index.py` | One-time script: embed all images + build index |
| `config.py` | Centralised settings and paths |

### Frontend
| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Landing page |
| `src/app/dashboard/page.tsx` | Search UI — upload, filter, results |
| `src/app/login/page.tsx` | Login form |
| `src/app/signup/page.tsx` | Signup form |
| `src/lib/api.ts` | API client — `searchSimilarXrays()` |
| `src/lib/constants.ts` | Types, disease colours, disease list |

---

## Upgrading to Google CXR Foundation

If you get access to `google/cxr-foundation` on HuggingFace (chest-X-ray specific, 2048-dim):

```python
# config.py
CXR_VIT_MODEL_NAME = "google/cxr-foundation"
EMBEDDING_DIM = 2048
```

Then re-run `build_index.py`. The rest of the pipeline is unchanged.

---

## Notes

- Backend cold-start on Render free tier: ~30–60 s (first request).
  Consider Render Starter ($7/mo) for always-on.
- NIH images are de-identified and cleared for academic research use.
- This is a **research tool only** — not a clinical diagnostic device.
