# XRaySearch — FastAPI Backend

Semantic chest X-ray retrieval using Google CXR ViT + HNSW + SQLite.

## Architecture

```
Upload X-ray
     │
     ▼
[Google CXR ViT] ──► 768/2048-dim embedding
     │
     ▼
[SQLite pre-filter] ◄── age / gender / diagnosis filters
     │ filtered image_id set
     ▼
[HNSW ANN search] ──► top-K nearest neighbours (cosine similarity)
     │
     ▼
[Patient metadata lookup] ──► JSON response with image URLs
```

## Setup

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Get the NIH ChestX-ray14 dataset
- Download from: https://nihcc.app.box.com/v/ChestXray-NIHCC
- You need: `Data_Entry_2017.csv` + the image zip files
- Extract images to a folder, e.g. `/data/nih_images/`

### 3. Build the index (run once, on GPU if possible)
```bash
python build_index.py \
  --csv   /path/to/Data_Entry_2017.csv \
  --images /path/to/nih_images/
```

This creates:
- `data/hnsw_index.bin` — HNSW index (~50MB for 5606 images)
- `data/image_ids.json` — index → image_id mapping
- `data/nih_metadata.db` — SQLite patient metadata

### 4. (Optional) Host images on Cloudflare R2 / AWS S3
Upload all X-ray images to a public bucket. Set `IMAGE_BASE_URL` in `.env`.

### 5. Configure environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 6. Run locally
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs: http://localhost:8000/docs

## Deploy to Render (free tier)

1. Push this folder to a GitHub repo
2. Go to render.com → New Web Service → connect your repo
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables in Render dashboard
6. Mount a persistent disk at `/opt/render/project/src/data` (copy your `data/` files there)

## API Endpoints

### `POST /search`
Upload an X-ray and get similar cases.

**Form fields:**
| Field | Type | Description |
|-------|------|-------------|
| file | File | PNG/JPG/DICOM X-ray |
| age_group | string | e.g. `"41-60"`, `"81+"`, or `""` for any |
| gender | string | `"M"`, `"F"`, or `""` for any |
| diagnosis | string | NIH label e.g. `"Pneumonia"`, or `""` for any |
| top_k | int | Number of results (default 6) |

**Response:**
```json
{
  "results": [
    {
      "image_id": "00001234_000.png",
      "patient_id": "1234",
      "age": 54,
      "gender": "M",
      "view_position": "PA",
      "diagnoses": ["Infiltration", "Consolidation"],
      "similarity": 94.3,
      "image_url": "https://your-bucket.r2.../00001234_000.png"
    }
  ],
  "retrieval_ms": 48,
  "pre_filter_count": 312,
  "total_indexed": 5606
}
```

### `GET /health`
```json
{ "status": "ok", "indexed": 5606 }
```

## Using Google CXR Foundation Model
If you have access to `google/cxr-foundation` on HuggingFace:
```bash
# In .env:
CXR_VIT_MODEL=google/cxr-foundation
```
This gives 2048-dim embeddings trained specifically on chest X-rays.
Update `EMBEDDING_DIM=2048` in `config.py` and rebuild the index.
