#!/bin/bash

ROOT="$(cd "$(dirname "$0")" && pwd)"

# Start backend
start "" bash -c "cd '$ROOT/xraysearch-backend' && source venv/Scripts/activate && uvicorn main:app --reload; exec bash"

# Start frontend
start "" bash -c "cd '$ROOT/xraysearch-frontend' && npm run dev; exec bash"