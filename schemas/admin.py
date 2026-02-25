"""Admin API schemas - match admin dashboard expected format."""

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel


# Feeds
class FeedCreate(BaseModel):
    name: str
    url: str
    category: str
    status: Optional[str] = "active"


class FeedUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None


class FeedResponse(BaseModel):
    id: int
    name: str
    url: str
    category: str
    status: str
    articlesCount: Optional[int] = 0
    lastFetched: Optional[datetime] = None
    createdAt: Optional[datetime] = None

    model_config = {"from_attributes": True, "populate_by_name": True}


# Articles (map from Article model)
class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None
    content: Optional[str] = None
    status: Optional[str] = None
    topics: Optional[list[str]] = None
    entities: Optional[list[str]] = None


# Stories (map from Project model)
class StoryCreate(BaseModel):
    articleId: Optional[int] = None
    title: str
    content: str
    summary: Optional[str] = None
    status: str = "draft"
    charts: Optional[list] = None
    datasets: Optional[list] = None


class StoryUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    status: Optional[str] = None
    charts: Optional[list] = None
    datasets: Optional[list] = None


class StoryResponse(BaseModel):
    id: int
    articleId: Optional[int] = None
    title: str
    content: str
    summary: Optional[str] = None
    status: str
    charts: Optional[list] = None
    datasets: Optional[list] = None
    publishedAt: Optional[datetime] = None
    createdAt: Optional[datetime] = None

    model_config = {"from_attributes": True, "populate_by_name": True}


# Forecasts (map from ForecastSpecDB + ForecastRun)
class ForecastCreate(BaseModel):
    storyId: Optional[int] = None
    topic: str
    target: str
    probability: float
    confidence: str = "medium"
    modelType: str = "baseline"
    horizon: Optional[str] = None
    status: str = "active"
    scenarios: Optional[list] = None


class ForecastUpdate(BaseModel):
    topic: Optional[str] = None
    target: Optional[str] = None
    probability: Optional[float] = None  # 0-100 or 0-1, normalized in handler
    horizon: Optional[str] = None
    confidence: Optional[str] = None
    status: Optional[str] = None
    scenarios: Optional[list] = None


# Dashboard
class DashboardStats(BaseModel):
    totalFeeds: int
    activeFeeds: int
    totalArticles: int
    pendingArticles: int
    totalStories: int
    publishedStories: int
    totalForecasts: int
    activeForecasts: int
    agentsRunning: int
    agentsWithErrors: int
