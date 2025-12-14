from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
import os

# Use sync engine instead of async
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://chimera:chimera_secure_pass@postgres:5432/chimera_db"
).replace("+asyncpg", "")  # Remove +asyncpg if present

engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True,
    pool_size=20,
    max_overflow=0
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,
)

def get_db() -> Generator[Session, None, None]:
    """
    Dependency function that yields db sessions
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()