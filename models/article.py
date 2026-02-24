"""Articles model - normalised content from RSS."""

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from core.db import Base


class Article(Base):
    """Normalised article content with extracted entities and topics."""

    __tablename__ = "articles"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    rss_item_id: Mapped[Optional[int]] = mapped_column(nullable=True)
    headline: Mapped[str] = mapped_column(String(1024))
    dek: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    body: Mapped[str] = mapped_column(Text)
    article_url: Mapped[str] = mapped_column(String(2048), index=True)
    source: Mapped[str] = mapped_column(String(256), index=True)
    topics: Mapped[list] = mapped_column(JSON, default=list)
    entities: Mapped[list] = mapped_column(JSON, default=list)
    key_numbers: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    quotes: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
