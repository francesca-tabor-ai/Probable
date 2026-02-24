"""Projects model - final publishable units."""

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from core.db import Base


class Project(Base):
    """Final project: article + analysis + forecast + charts."""

    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(256), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(512))
    lede: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    origin_article_id: Mapped[Optional[int]] = mapped_column(nullable=True)
    sections: Mapped[list] = mapped_column(JSON, default=list)
    charts: Mapped[list] = mapped_column(JSON, default=list)
    datasets: Mapped[list] = mapped_column(JSON, default=list)
    methodology: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    forecast_block: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(64), index=True, default="draft")
    topic: Mapped[str] = mapped_column(String(128), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
