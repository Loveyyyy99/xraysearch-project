from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

# Paths
HNSW_INDEX_PATH   = DATA_DIR / "hnsw_index.bin"
IMAGE_IDS_PATH    = DATA_DIR / "image_ids.json"
METADATA_DB_PATH  = DATA_DIR / "nih_metadata.db"
IMAGES_DIR        = DATA_DIR / "images"          # local fallback; use S3/R2 in prod

# Model
CXR_VIT_MODEL_NAME = os.getenv("CXR_VIT_MODEL", "microsoft/rad-dino")
# If you have access to google/cxr-foundation, set CXR_VIT_MODEL to that.
# Otherwise the default ViT gives decent embeddings for demo purposes.

EMBEDDING_DIM = 768  # 768 for ViT-base; set to 2048 if using CXR Foundation

# HNSW params
HNSW_M              = 32
HNSW_EF_CONSTRUCTION = 200
HNSW_EF_SEARCH      = 100

# Image hosting – set IMAGE_BASE_URL to your S3/R2/CDN bucket in production
IMAGE_BASE_URL = os.getenv("IMAGE_BASE_URL", "")

# CORS
ALLOWED_ORIGINS = ["*"]