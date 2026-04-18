"""
HNSW vector index manager using hnswlib.
"""
import json
import numpy as np
import hnswlib
from pathlib import Path
from config import (
    HNSW_INDEX_PATH, IMAGE_IDS_PATH,
    EMBEDDING_DIM, HNSW_M, HNSW_EF_CONSTRUCTION, HNSW_EF_SEARCH
)
import logging

logger = logging.getLogger(__name__)

_index: hnswlib.Index | None = None
_image_ids: list[str] = []


def load_index():
    """Load the pre-built HNSW index and image ID mapping from disk."""
    global _index, _image_ids
    if _index is not None:
        return

    if not HNSW_INDEX_PATH.exists():
        raise FileNotFoundError(
            f"HNSW index not found at {HNSW_INDEX_PATH}. "
            "Run build_index.py first to generate it."
        )

    with open(IMAGE_IDS_PATH) as f:
        _image_ids = json.load(f)

    _index = hnswlib.Index(space="cosine", dim=EMBEDDING_DIM)
    _index.load_index(str(HNSW_INDEX_PATH), max_elements=len(_image_ids))
    _index.set_ef(HNSW_EF_SEARCH)
    logger.info(f"[Index] Loaded {len(_image_ids)} vectors from {HNSW_INDEX_PATH}")


def build_index(embeddings: np.ndarray, image_ids: list[str]):
    """
    Build and persist a new HNSW index.
    Called once from build_index.py.
    """
    n = len(image_ids)
    idx = hnswlib.Index(space="cosine", dim=embeddings.shape[1])
    idx.init_index(max_elements=n, ef_construction=HNSW_EF_CONSTRUCTION, M=HNSW_M)
    idx.add_items(embeddings, list(range(n)))
    idx.set_ef(HNSW_EF_SEARCH)
    idx.save_index(str(HNSW_INDEX_PATH))

    with open(IMAGE_IDS_PATH, "w") as f:
        json.dump(image_ids, f)

    logger.info(f"[Index] Built and saved index with {n} vectors.")


def search(
    query_embedding: np.ndarray,
    top_k: int = 10,
    filter_ids: list[str] | None = None,
) -> list[tuple[str, float]]:
    """
    Search for top-k most similar images.

    If filter_ids is provided (from SQLite metadata pre-filter),
    only those image IDs are considered.

    Returns list of (image_id, similarity_score) tuples.
    """
    load_index()

    if filter_ids is not None:
        # Build a set of internal integer labels to restrict search
        filter_set = set(filter_ids)
        valid_labels = [i for i, iid in enumerate(_image_ids) if iid in filter_set]

        if not valid_labels:
            return []

        # Search with a larger k first, then post-filter
        search_k = min(len(valid_labels), max(top_k * 10, 500))
        labels, distances = _index.knn_query(query_embedding, k=search_k)
        labels, distances = labels[0], distances[0]

        # Filter to only include labels in the valid set
        valid_set = set(valid_labels)
        filtered = [(l, d) for l, d in zip(labels, distances) if l in valid_set]
        filtered = filtered[:top_k]
    else:
        search_k = min(len(_image_ids), top_k)
        labels, distances = _index.knn_query(query_embedding, k=search_k)
        labels, distances = labels[0], distances[0]
        filtered = list(zip(labels, distances))

    # Convert cosine distance → similarity percentage
    results = []
    for label, dist in filtered:
        image_id = _image_ids[label]
        similarity = round((1.0 - float(dist)) * 100, 1)
        results.append((image_id, similarity))

    return results


def get_total_indexed() -> int:
    load_index()
    return len(_image_ids)
