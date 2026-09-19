# XRaySearch

> **Hybrid semantic chest X-ray retrieval system** — upload an X-ray, get back the most visually similar cases from the NIH ChestX-ray14 dataset, filtered by disease labels and patient metadata.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.11x-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Screenshots
### Login/Signup Page

<img width="902" height="832" alt="login" src="https://github.com/user-attachments/assets/22d1c629-f82c-4c0e-83ed-82e51917c709" />
<img width="1600" height="771" alt="signup" src="https://github.com/user-attachments/assets/3ef238b3-fffd-46d0-a4c6-565dc369a076" />

### Landing Page
<!-- TODO: add screenshot -->
<img width="1600" height="760" alt="landing" src="https://github.com/user-attachments/assets/b454d0d3-256a-4d63-9420-362d16ec91de" />
<img width="1600" height="735" alt="landing" src="https://github.com/user-attachments/assets/95f89f99-b5f2-4222-a19c-d04da13fa2f9" />
<img width="1600" height="701" alt="landing" src="https://github.com/user-attachments/assets/53e08b8d-117e-4774-bd47-005239ede3ca" />

### Search Dashboard
<!-- TODO: add screenshot — upload panel, filters, results grid -->
<img width="1600" height="759" alt="dashboard" src="https://github.com/user-attachments/assets/719ed10c-163a-40e1-8af8-b7e27c821ef1" />

### Search Results
<!-- TODO: add screenshot — similarity results with disease tags -->
![Results](.github/screenshots/results.png)

---

## How It Works

1. User uploads a chest X-ray image.
2. The **CXR ViT** (`google/vit-base-patch16-224-in21k`) encodes it into a 768-dim embedding.
3. **hnswlib** (HNSW, cosine space) finds the *k* nearest neighbours from 5,606 NIH images.
4. Optional pre-filters (disease label, patient age/sex) are applied via **SQLite** before the vector search.
5. Results are returned with image URLs, similarity scores, and metadata.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Embedding model | Google CXR ViT (`vit-base-patch16-224-in21k`) |
| Vector search | hnswlib — HNSW, cosine space |
| Metadata filter | SQLite3 |
| Backend | FastAPI + Uvicorn |
| Frontend | Next.js 16 + TypeScript + Tailwind CSS v4 |
| Dataset | NIH ChestX-ray14 · Wang et al., 2017 · 5,606 images |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Repo Structure

```
xraysearch-project/
├── xraysearch/            # Next.js 16 frontend  → deploy to Vercel
│   ├── src/app/
│   │   ├── page.tsx           # Landing page
│   │   ├── dashboard/page.tsx # Search UI — upload, filter, results
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   └── src/lib/
│       ├── api.ts             # API client — searchSimilarXrays()
│       └── constants.ts       # Types, disease colours, disease list
│
└── xraysearch-backend/    # FastAPI backend      → deploy to Render
    ├── main.py                # /search and /health endpoints
    ├── embedder.py            # ViT encoder → 768-dim vectors
    ├── index.py               # HNSW index — build, load, search
    ├── database.py            # SQLite metadata — schema + queries
    ├── build_index.py         # One-time: embed all images + build index
    └── config.py              # Centralised settings and paths
```

---

## Getting Started

### Prerequisites

- Python 3.10+, Node.js 18+
- GPU recommended for index building (Google Colab Pro works fine)
- NIH ChestX-ray14 dataset ([download here](https://nihcc.app.box.com/v/ChestXray-NIHCC))

### 1 — Build the vector index (run once)

```bash
cd xraysearch-backend
pip install -r requirements.txt

python build_index.py \
  --csv    /path/to/Data_Entry_2017.csv \
  --images /path/to/images/
```

Outputs three files into `data/`:

| File | Description |
|---|---|
| `hnsw_index.bin` | HNSW vector index (~50 MB) |
| `image_ids.json` | Index position → filename mapping |
| `nih_metadata.db` | SQLite patient metadata |

> **Time estimate:** ~20–40 min on GPU, ~2–4 hrs on CPU.

### 2 — Run locally

**Backend**
```bash
cd xraysearch-backend
cp .env.example .env          # edit paths as needed
uvicorn main:app --reload
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

**Frontend**
```bash
cd xraysearch
npm install
cp .env.local.example .env.local
# set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
# App: http://localhost:3000
```

---

## Deployment

### Backend → Render

1. Push `xraysearch-backend/` to GitHub.
2. Render → **New Web Service** → connect repo.
3. Settings:
   - **Build:** `pip install -r requirements.txt`
   - **Start:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add a **Persistent Disk** at `/opt/render/project/src/data` (10 GB) and upload your `data/` files.
5. Environment variables:
   ```
   CXR_VIT_MODEL=google/vit-base-patch16-224-in21k
   IMAGE_BASE_URL=https://your-bucket.../xrays
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```

### Frontend → Vercel

1. Push `xraysearch/` to GitHub.
2. Vercel → **New Project** → import repo (Next.js auto-detected).
3. Environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://xraysearch-api.onrender.com
   ```

> **Note:** Render free tier has a ~30–60 s cold-start on first request. Upgrade to Render Starter ($7/mo) for always-on.

### Image hosting (recommended)

Upload NIH images to Cloudflare R2 (free 10 GB) or AWS S3:
```bash
aws s3 sync /path/to/images/ s3://your-bucket/xrays/ --acl public-read
```
Then set `IMAGE_BASE_URL` accordingly.

---

## Upgrading to Google CXR Foundation

If you get access to `google/cxr-foundation` on HuggingFace (chest-X-ray specific, 2048-dim):

```python
# config.py
CXR_VIT_MODEL_NAME = "google/cxr-foundation"
EMBEDDING_DIM = 2048
```

Re-run `build_index.py`. The rest of the pipeline is unchanged.

---

## Dataset

NIH ChestX-ray14 · Wang et al., 2017  
112,120 frontal-view X-rays from 30,805 patients across 14 disease labels.  
Images are de-identified and cleared for academic research use.

> ⚠️ **This is a research tool only — not a clinical diagnostic device.**

---

## License

MIT
