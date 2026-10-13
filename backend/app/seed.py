import os
from pathlib import Path
from app.config import get_settings

def run_seed():
    settings = get_settings()
    data_dir = Path(settings.data_dir)
    data_dir.mkdir(exist_ok=True)
    print("Running initial data seed...")

if __name__ == "__main__":
    run_seed()
