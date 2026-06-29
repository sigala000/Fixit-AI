"""
FIXIT Agent - FastAPI Application Entry Point

Configures and exposes the ADK agent as a FastAPI application.
Supports both local development (GOOGLE_GENAI_USE_VERTEXAI=False)
and GCP deployment (GOOGLE_GENAI_USE_VERTEXAI=True).
"""

import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from google.adk.cli.fast_api import get_fast_api_app

# Load .env file for local development
load_dotenv()

# ─── Logging Setup ─────────────────────────────────────────────────────────────
# Use Google Cloud Logging only when deployed to GCP (Vertex AI mode).
# Fall back to standard Python logging for local development.
use_vertexai = os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "False").lower() == "true"

if use_vertexai:
    try:
        import google.auth
        from google.cloud import logging as google_cloud_logging

        _, project_id = google.auth.default()
        logging_client = google_cloud_logging.Client()
        logger = logging_client.logger(__name__)
        print(f"[fixit-agent] Using GCP Cloud Logging | project: {project_id}")
    except Exception as e:
        print(
            f"[fixit-agent] WARNING: GCP logging unavailable ({e}). Falling back to stdout."
        )
        logging.basicConfig(level=logging.INFO)
        logger = logging.getLogger(__name__)
else:
    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    )
    logger = logging.getLogger(__name__)
    print("[fixit-agent] Running in LOCAL mode (Gemini API direct, no GCP)")

# ─── Optional Telemetry (GCP only) ─────────────────────────────────────────────
if use_vertexai:
    try:
        from app.app_utils.telemetry import setup_telemetry

        setup_telemetry()
    except Exception as e:
        print(f"[fixit-agent] Telemetry setup skipped: {e}")

# ─── App Configuration ──────────────────────────────────────────────────────────
allow_origins_str = os.getenv(
    "ALLOW_ORIGINS", "http://localhost:5173,http://localhost:3000"
)
allow_origins = allow_origins_str.split(",") if allow_origins_str else None

logs_bucket_name = os.environ.get("LOGS_BUCKET_NAME")
artifact_service_uri = f"gs://{logs_bucket_name}" if logs_bucket_name else None
session_service_uri = None  # In-memory sessions for free tier

AGENT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ─── Build FastAPI App ──────────────────────────────────────────────────────────
app: FastAPI = get_fast_api_app(
    agents_dir=AGENT_DIR,
    web=True,
    artifact_service_uri=artifact_service_uri,
    allow_origins=allow_origins,
    session_service_uri=session_service_uri,
)
app.title = "FIXIT AI Agent"
app.description = (
    "Multi-agent AI platform for artisan repair service matching in Cameroon."
)


# ─── Feedback Endpoint ──────────────────────────────────────────────────────────
try:
    from app.app_utils.typing import Feedback

    @app.post("/feedback")
    def collect_feedback(feedback: Feedback) -> dict[str, str]:
        """Collect and log user feedback on agent responses."""
        if hasattr(logger, "log_struct"):
            logger.log_struct(feedback.model_dump(), severity="INFO")
        else:
            logger.info("Feedback received: %s", feedback.model_dump())
        return {"status": "success"}
except ImportError:
    pass  # Feedback endpoint optional

# ─── Main ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
