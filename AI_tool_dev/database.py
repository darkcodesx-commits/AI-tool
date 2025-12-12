"""
Database models and setup for call logging
"""
try:
    from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Float
    from sqlalchemy.ext.declarative import declarative_base
    from sqlalchemy.orm import sessionmaker
    SQLALCHEMY_AVAILABLE = True
except ImportError:
    SQLALCHEMY_AVAILABLE = False
    import logging
    logger = logging.getLogger(__name__)
    logger.warning("SQLAlchemy not available. Database logging will be disabled.")
    
# Export SQLALCHEMY_AVAILABLE
__all__ = ['SQLALCHEMY_AVAILABLE', 'Base', 'CallLog', 'init_db', 'get_db']

from datetime import datetime
from config import settings

if SQLALCHEMY_AVAILABLE:
    Base = declarative_base()
else:
    Base = None


class CallLog(Base):
    """Model for storing call logs and transcripts"""
    __tablename__ = "call_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    call_sid = Column(String, unique=True, index=True)
    phone_number = Column(String)
    direction = Column(String)  # 'inbound' or 'outbound'
    status = Column(String)  # 'initiated', 'in-progress', 'completed', 'failed'
    transcript = Column(Text)
    duration = Column(Float)  # in seconds
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# Database setup
if SQLALCHEMY_AVAILABLE:
    engine = create_engine(settings.database_url, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
else:
    engine = None
    SessionLocal = None


def init_db():
    """Initialize database tables"""
    if not SQLALCHEMY_AVAILABLE:
        return
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"Database initialization failed: {str(e)}")


def get_db():
    """Get database session"""
    if not SQLALCHEMY_AVAILABLE:
        return None
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

