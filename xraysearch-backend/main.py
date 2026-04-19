"""
XRaySearch FastAPI Backend
--------------------------
POST /search   — Upload X-ray image + filters → return similar cases
GET  /health   — Health check + index status
"""
import time
import logging
from pathlib import Path
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from config import ALLOWED_ORIGINS, IMAGE_BASE_URL
from embedder import embed_image
from index import search, get_total_indexed
from database import query_filtered_ids, get_patient_info

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ── Download data files from HF Space storage if missing ──────────────────────

def ensure_data_files():
    """Download data files from HF if not present (for HF Spaces Docker deployment)."""
    from huggingface_hub import hf_hub_download

    data_dir = Path("/app/data")
    data_dir.mkdir(exist_ok=True)

    repo_id = "loveyyyyyyyyy/xraysearch-backend"
    files_to_check = [
        "data/hnsw_index.bin",
        "data/image_ids.json",
        "data/nih_metadata.db",
    ]

    for repo_file in files_to_check:
        local_path = Path("/app") / repo_file
        if not local_path.exists():
            logger.info(f"Downloading {repo_file} from HF Space...")
            hf_hub_download(
                repo_id=repo_id,
                filename=repo_file,
                repo_type="space",
                local_dir="/app",
                local_dir_use_symlinks=False,
            )
            logger.info(f"Downloaded {repo_file} successfully.")
        else:
            logger.info(f"{repo_file} already exists, skipping download.")

ensure_data_files()


# ── App setup ──────────────────────────────────────────────────────────────────

app = FastAPI(
    title="XRaySearch API",
    description="Hybrid semantic search for chest X-rays using Google CXR ViT + HNSW.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Response models ────────────────────────────────────────────────────────────

class SearchResult(BaseModel):
    image_id:      str
    patient_id:    str
    age:           int
    gender:        str
    view_position: str
    diagnoses:     list[str]
    similarity:    float
    image_url:     str | None = None


class SearchResponse(BaseModel):
    results:          list[SearchResult]
    retrieval_ms:     int
    pre_filter_count: int
    total_indexed:    int


class HealthResponse(BaseModel):
    status:  str
    indexed: int


# ── Endpoints ──────────────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse)
async def health():
    try:
        total = get_total_indexed()
        return HealthResponse(status="ok", indexed=total)
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.post("/search", response_model=SearchResponse)
async def search_xrays(
    file:       UploadFile = File(..., description="Chest X-ray image (PNG/JPG/DICOM)"),
    age_group:  str = Form("",  description="Age range e.g. '41-60' or '81+'"),
    gender:     str = Form("",  description="M or F or empty for any"),
    diagnosis:  str = Form("",  description="NIH label e.g. 'Pneumonia' or empty"),
    top_k:      int = Form(6,   description="Number of results to return"),
):
    # Validate file type
    if file.content_type not in ("image/jpeg", "image/png", "image/webp", "application/octet-stream"):
        if not (file.filename or "").lower().endswith((".jpg", ".jpeg", ".png", ".dcm")):
            raise HTTPException(status_code=400, detail="Unsupported file type. Use PNG, JPG, or DICOM.")

    image_bytes = await file.read()
    if len(image_bytes) > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 25 MB.")

    t0 = time.monotonic()

    # 1. Generate query embedding
    try:
        query_emb = embed_image(image_bytes)
    except Exception as e:
        logger.error(f"Embedding failed: {e}")
        raise HTTPException(status_code=500, detail=f"Embedding failed: {e}")

    # 2. SQLite metadata pre-filter
    filter_ids = None
    pre_filter_count = get_total_indexed()

    if age_group or gender or diagnosis:
        filter_ids = query_filtered_ids(
            age_group=age_group or None,
            gender=gender or None,
            diagnosis=diagnosis or None,
        )
        pre_filter_count = len(filter_ids)
        if not filter_ids:
            return SearchResponse(
                results=[],
                retrieval_ms=int((time.monotonic() - t0) * 1000),
                pre_filter_count=0,
                total_indexed=get_total_indexed(),
            )

    # 3. HNSW ANN search
    try:
        raw_results = search(query_emb, top_k=top_k, filter_ids=filter_ids)
    except Exception as e:
        logger.error(f"Search failed: {e}")
        raise HTTPException(status_code=500, detail=f"Vector search failed: {e}")

    retrieval_ms = int((time.monotonic() - t0) * 1000)

    # 4. Fetch patient metadata
    result_image_ids = [r[0] for r in raw_results]
    meta = get_patient_info(result_image_ids)

    # 5. Build response
    results: list[SearchResult] = []
    for image_id, similarity in raw_results:
        info = meta.get(image_id, {})
        image_url = None
        if IMAGE_BASE_URL:
            image_url = f"{IMAGE_BASE_URL.rstrip('/')}/{image_id}"

        results.append(SearchResult(
            image_id=image_id,
            patient_id=info.get("patient_id", image_id),
            age=info.get("age", 0),
            gender=info.get("gender", "M"),
            view_position=info.get("view_position", "PA"),
            diagnoses=info.get("diagnoses", ["No Finding"]),
            similarity=similarity,
            image_url=image_url,
        ))

    logger.info(
        f"/search → {len(results)} results | pre-filter: {pre_filter_count} "
        f"| {retrieval_ms}ms | age={age_group} gender={gender} dx={diagnosis}"
    )

    return SearchResponse(
        results=results,
        retrieval_ms=retrieval_ms,
        pre_filter_count=pre_filter_count,
        total_indexed=get_total_indexed(),
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
