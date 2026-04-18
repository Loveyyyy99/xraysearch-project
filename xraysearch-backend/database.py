"""
SQLite metadata store for NIH ChestX-ray14.

Schema is built from Data_Entry_2017.csv which has columns:
  Image Index, Finding Labels, Follow-up #, Patient ID,
  Patient Age, Patient Sex, View Position, ...
"""
import sqlite3
import pandas as pd
from pathlib import Path
from config import METADATA_DB_PATH


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(str(METADATA_DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def build_database(csv_path: str, image_subset: list[str] | None = None):
    """
    Call once during index building.
    csv_path: path to Data_Entry_2017.csv from NIH dataset.
    image_subset: list of image filenames to include (optional 5606-image subset).
    """
    df = pd.read_csv(csv_path)
    if image_subset:
        df = df[df["Image Index"].isin(image_subset)]

    conn = get_conn()
    conn.execute("DROP TABLE IF EXISTS patients")
    conn.execute("""
        CREATE TABLE patients (
            image_id     TEXT PRIMARY KEY,
            patient_id   TEXT,
            age          INTEGER,
            gender       TEXT,
            view_position TEXT,
            diagnoses    TEXT    -- pipe-separated labels
        )
    """)

    rows = []
    for _, row in df.iterrows():
        rows.append((
            str(row["Image Index"]),
            str(row["Patient ID"]),
            int(row["Patient Age"]) if pd.notna(row["Patient Age"]) else 0,
            str(row["Patient Sex"]),
            str(row.get("View Position", "PA")),
            str(row["Finding Labels"]),
        ))

    conn.executemany(
        "INSERT OR REPLACE INTO patients VALUES (?,?,?,?,?,?)", rows
    )
    conn.execute("CREATE INDEX IF NOT EXISTS idx_age ON patients(age)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_gender ON patients(gender)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_diagnoses ON patients(diagnoses)")
    conn.commit()
    conn.close()
    print(f"[DB] Inserted {len(rows)} rows into SQLite.")


def query_filtered_ids(
    age_group: str | None = None,
    gender: str | None = None,
    diagnosis: str | None = None,
) -> list[str]:
    """
    Pre-filter patient cohort by metadata before vector search.
    Returns list of image_ids matching all supplied filters.
    """
    conn = get_conn()
    clauses, params = [], []

    if age_group and age_group != "":
        if age_group == "81+":
            clauses.append("age >= 81")
        elif "-" in age_group:
            lo, hi = age_group.split("-")
            clauses.append("age BETWEEN ? AND ?")
            params += [int(lo), int(hi)]

    if gender and gender in ("M", "F"):
        clauses.append("gender = ?")
        params.append(gender)

    if diagnosis and diagnosis != "":
        clauses.append("diagnoses LIKE ?")
        params.append(f"%{diagnosis}%")

    where = ("WHERE " + " AND ".join(clauses)) if clauses else ""
    rows = conn.execute(f"SELECT image_id FROM patients {where}", params).fetchall()
    conn.close()
    return [r["image_id"] for r in rows]


def get_patient_info(image_ids: list[str]) -> dict[str, dict]:
    """Fetch metadata for a list of image_ids."""
    if not image_ids:
        return {}
    conn = get_conn()
    placeholders = ",".join("?" * len(image_ids))
    rows = conn.execute(
        f"SELECT * FROM patients WHERE image_id IN ({placeholders})", image_ids
    ).fetchall()
    conn.close()
    return {
        r["image_id"]: {
            "patient_id":    r["patient_id"],
            "age":           r["age"],
            "gender":        r["gender"],
            "view_position": r["view_position"],
            "diagnoses":     [d.strip() for d in r["diagnoses"].split("|") if d.strip()],
        }
        for r in rows
    }
