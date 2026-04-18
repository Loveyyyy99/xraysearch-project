"""
Embedding module using Google CXR Vision Transformer.

Primary:  google/cxr-foundation  (requires HuggingFace access)
Fallback: google/vit-base-patch16-224-in21k  (open-access, good proxy)

Set CXR_VIT_MODEL env var to choose.
"""
import io
import numpy as np
from PIL import Image
import torch
from transformers import AutoImageProcessor, AutoModel
from config import CXR_VIT_MODEL_NAME, EMBEDDING_DIM
import logging

logger = logging.getLogger(__name__)

_extractor = None
_model = None
_device = None


def _load_model():
    global _extractor, _model, _device
    if _model is not None:
        return
    logger.info(f"Loading model: {CXR_VIT_MODEL_NAME}")
    _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    _extractor = AutoImageProcessor.from_pretrained(CXR_VIT_MODEL_NAME)
    _model = AutoModel.from_pretrained(CXR_VIT_MODEL_NAME).to(_device)
    _model.eval()
    logger.info(f"Model loaded on {_device}")


def preprocess_image(image_bytes: bytes) -> Image.Image:
    """Load and preprocess a chest X-ray image."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    return img


def embed_image(image_bytes: bytes) -> np.ndarray:
    """
    Generate a normalised embedding vector for a single image.
    Returns shape (EMBEDDING_DIM,) float32 array.
    """
    _load_model()
    img = preprocess_image(image_bytes)
    inputs = _extractor(images=img, return_tensors="pt").to(_device)

    with torch.no_grad():
        outputs = _model(**inputs)

    # CLS token representation
    embedding = outputs.last_hidden_state[:, 0, :].squeeze().cpu().numpy().astype(np.float32)

    # L2 normalise for cosine similarity via inner product
    norm = np.linalg.norm(embedding)
    if norm > 0:
        embedding = embedding / norm

    return embedding


def embed_image_batch(image_paths: list[str]) -> np.ndarray:
    """
    Embed a batch of image file paths. Used during index construction.
    Returns (N, EMBEDDING_DIM) array.
    """
    _load_model()
    embeddings = []
    for i, path in enumerate(image_paths):
        try:
            with open(path, "rb") as f:
                emb = embed_image(f.read())
            embeddings.append(emb)
            if (i + 1) % 100 == 0:
                logger.info(f"  Embedded {i+1}/{len(image_paths)}")
        except Exception as e:
            logger.warning(f"  Skipping {path}: {e}")
            embeddings.append(np.zeros(EMBEDDING_DIM, dtype=np.float32))
    return np.array(embeddings, dtype=np.float32)
