"""Pipeline message schemas for agent handoffs."""

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class Entity(BaseModel):
    """Detected entity from article (person, place, organisation)."""

    type: str  # organisation, place, person, etc.
    name: str
    metadata: dict[str, Any] = Field(default_factory=dict)


class ForecastSpec(BaseModel):
    """Output of Forecast Design Agent: what to forecast and how."""

    target: str  # e.g. "UK national seat share for Party A"
    horizon: str  # e.g. "next election date"
    granularity: str  # national | regional
    constraints: dict[str, Any] = Field(
        default_factory=lambda: {
            "probabilistic": True,
            "uncertainty_bands": True,
            "refresh_cadence": "daily",
        }
    )
    topic: str = "elections"


class PartyForecast(BaseModel):
    """Forecast for a single party/candidate."""

    party: str
    seat_mean: float
    seat_std: float
    win_prob: float
    vote_share_mean: float | None = None
    vote_share_std: float | None = None
    quantiles: dict[str, float] = Field(default_factory=dict)  # p10, p50, p90


class ForecastResult(BaseModel):
    """Output of Forecast Computation Agent."""

    targets: list[PartyForecast]
    model_name: str = "elections_seat_model"
    run_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: dict[str, Any] = Field(default_factory=dict)


class PipelineStatus(str, Enum):
    """Pipeline processing status."""

    ingested = "ingested"
    topic_done = "topic_done"
    data_done = "data_done"
    forecast_done = "forecast_done"
    draft_done = "draft_done"
    critic_done = "critic_done"
    governance_done = "governance_done"
    published = "published"
    failed = "failed"
    pending_review = "pending_review"


class ProjectContext(BaseModel):
    """Shared context passed between agents."""

    article_id: str = ""
    project_id: str | None = None
    topic: str = ""
    entities: list[Entity] = Field(default_factory=list)
    data_template: str = ""
    dataset: dict[str, Any] | None = None
    dataset_id: str | None = None
    forecast_spec: ForecastSpec | None = None
    forecast_result: ForecastResult | None = None
    calibration_flags: list[str] = Field(default_factory=list)
    forecast_narrative: str = ""
    draft_sections: dict[str, str] = Field(default_factory=dict)
    critic_issues: list[dict[str, Any]] = Field(default_factory=list)
    methodology: str = ""
    status: PipelineStatus = PipelineStatus.ingested
    origin_article: dict[str, Any] = Field(default_factory=dict)
    analysis_findings: dict[str, Any] = Field(default_factory=dict)
    scenarios: list[dict[str, Any]] = Field(default_factory=list)
    charts: list[dict[str, Any]] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)

    model_config = {"arbitrary_types_allowed": True}
