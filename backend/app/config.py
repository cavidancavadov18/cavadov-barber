import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def _sqlite_url() -> str:
    raw = os.environ.get("DATABASE_URL", f"file:./dev.db")
    if raw.startswith("sqlite:"):
        return raw
    if raw.startswith("file:"):
        path = raw[5:]
        if path.startswith("./"):
            # Prisma resolves relative to prisma/
            path = str((ROOT / "prisma" / path[2:]).resolve())
        return f"sqlite:///{path}"
    return f"sqlite:///{raw}"


class Settings:
    database_url: str = _sqlite_url()
    admin_secret: str = os.environ.get(
        "ADMIN_SECRET", "cavadov-barber-admin-dev-secret"
    )
    whatsapp_number: str = os.environ.get("WHATSAPP_NUMBER", "994553535368")
    public_whatsapp_number: str = os.environ.get(
        "NEXT_PUBLIC_WHATSAPP_NUMBER", "994553535368"
    )
    site_url: str = os.environ.get("NEXT_PUBLIC_SITE_URL", "http://localhost:3000")
    upload_dir: Path = Path(
        os.environ.get("UPLOAD_DIR", str(ROOT / "public" / "media" / "uploads"))
    )
    cookie_secure: bool = os.environ.get("COOKIE_SECURE", "").lower() in {
        "1",
        "true",
        "yes",
    } or os.environ.get("NODE_ENV") == "production"


settings = Settings()
