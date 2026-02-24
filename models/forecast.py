"""Forecast specs and runs models."""

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, JSON, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from core.db import Base


class ForecastSpecDB(Base):
    """Stored forecast specification from Forecast Design Agent."""

    __tablename__ = "forecast_specs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_id: Mapped[Optional[int]] = mapped_column(nullable=True)
    article_id: Mapped[Optional[int]] = mapped_column(nullable=True)
    target: Mapped[str] = mapped_column(String(512))
    horizon: Mapped[str] = mapped_column(String(256))
    granularity: Mapped[str] = mapped_column(String(64))
    constraints: Mapped[dict] = mapped_column(JSON, default=dict)
    topic: Mapped[str] = mapped_column(String(128), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ForecastRun(Base):
    """Model run output: point estimates, distributions."""

    __tablename__ = "forecast_runs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_id: Mapped[Optional[int]] = mapped_column(nullable=True)
    forecast_spec_id: Mapped[Optional[int]] = mapped_column(nullable=True)
    model_name: Mapped[str] = mapped_column(String(128))
    result: Mapped[dict] = mapped_column(JSON, default=dict)
    calibration_flags: Mapped[list] = mapped_column(JSON, default=list)
    run_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    run_metadata: Mapped[dict] = mapped_column(JSON, default=dict)
