"""
build_index.py — Run once to:
  1. Load NIH ChestX-ray14 metadata CSV
  2. Embed all 5,606 images using CXR ViT
  3. Build and save the HNSW index
  4. Populate the SQLite metadata database

Usage:
  python build_index.py \
    --csv   /path/to/Data_Entry_2017.csv \
    --images /path/to/images/folder \
    --subset /path/to/subset_list.txt  # optional: one filename per line

Approx time: ~2-4 hours on CPU, ~20-40 min on GPU (5606 images).
Run on Google Colab Pro or AWS EC2 with GPU, then copy data/ to your backend.
"""
import argparse
import os
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
logger = logging.getLogger(__name__)


def main():
    parser = argparse.ArgumentParser(description="Build HNSW index for XRaySearch")
    parser.add_argument("--csv",    required=True, help="Path to Data_Entry_2017.csv")
    parser.add_argument("--images", required=True, help="Directory containing NIH X-ray images")
    parser.add_argument("--subset", default=None,  help="Text file with one image filename per line (optional)")
    args = parser.parse_args()

    from config import IMAGES_DIR, DATA_DIR
    from database import build_database
    from embedder import embed_image_batch
    from index import build_index

    images_dir = Path(args.images)

    # Load subset if provided
    if args.subset:
        with open(args.subset) as f:
            image_ids = [line.strip() for line in f if line.strip()]
        logger.info(f"Using subset of {len(image_ids)} images")
    else:
        image_ids = [f.name for f in images_dir.glob("*.png")]
        logger.info(f"Found {len(image_ids)} images in {images_dir}")

    # Filter to only existing files
    valid_ids = [iid for iid in image_ids if (images_dir / iid).exists()]
    logger.info(f"{len(valid_ids)} valid image files found")

    if not valid_ids:
        logger.error("No valid image files found. Check --images path.")
        return

    # Step 1: Build SQLite database
    logger.info("Step 1/3 — Building SQLite metadata database…")
    build_database(args.csv, image_subset=valid_ids)

    # Step 2: Generate embeddings
    logger.info("Step 2/3 — Generating CXR ViT embeddings (this takes a while)…")
    image_paths = [str(images_dir / iid) for iid in valid_ids]
    embeddings = embed_image_batch(image_paths)
    logger.info(f"Embeddings shape: {embeddings.shape}")

    # Step 3: Build HNSW index
    logger.info("Step 3/3 — Building HNSW index…")
    build_index(embeddings, valid_ids)

    logger.info("Done! Files saved to data/")
    logger.info(f"  {DATA_DIR / 'hnsw_index.bin'}")
    logger.info(f"  {DATA_DIR / 'image_ids.json'}")
    logger.info(f"  {DATA_DIR / 'nih_metadata.db'}")


if __name__ == "__main__":
    main()
