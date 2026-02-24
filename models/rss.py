"""RSS items model."""

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.db import Base


class RssItem(Base):
    """Raw RSS entry before processing."""

    __tablename__ = "rss_items"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    url: Mapped[str] = mapped_column(String(2048), unique=True, index=True)
    guid: Mapped[Optional[str]] = mapped_column(String(512), index=True, nullable=True)
    title: Mapped[str] = mapped_column(String(1024))
    body: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    raw_html: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source: Mapped[str] = mapped_column(String(256), index=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    processed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    article_id: Mapped[Optional[int]] = mapped_column(nullable=True)  # FK to articles.id
