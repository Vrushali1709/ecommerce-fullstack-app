import uvicorn
import os
import sys
from dotenv import load_dotenv

# Set UTF-8 encoding for standard output if available
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

load_dotenv()

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("DEBUG", "True").lower() in ("true", "1", "t")

    print("==================================================")
    print("Starting FastAPI E-Commerce Backend Server")
    print(f"Local URL:     http://localhost:{port}")
    print(f"Swagger Docs:  http://localhost:{port}/docs")
    print(f"ReDoc Docs:    http://localhost:{port}/redoc")
    print(f"Health Check:  http://localhost:{port}/health")
    print("==================================================")

    uvicorn.run("app.main:app", host=host, port=port, reload=reload)
