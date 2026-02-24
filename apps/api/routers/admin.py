"""Admin API - CRUD for all entities. Routes at /api/ for admin dashboard."""

from datetime import datetime
from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import delete, func, select

from core.db import DbSession
from models.article import Article
from models.dataset import DataSource, Dataset
from models.forecast import ForecastRun, ForecastSpecDB
from models.project import Project
from models.rss_feed import RssFeed
from models.user import User
from schemas.admin import (
    ArticleUpdate,
    DashboardStats,
    FeedCreate,
    FeedUpdate,
    ForecastCreate,
    ForecastUpdate,
    StoryCreate,
    StoryUpdate,
)

router = APIRouter(prefix="/api", tags=["admin"])

# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------


@router.get("/dashboard/stats", response_model=DashboardStats)
async def dashboard_stats(db: DbSession):
    """Aggregate stats for admin dashboard."""
    total_feeds = (await db.execute(select(func.count(RssFeed.id)))).scalar() or 0
    active_feeds = (
        await db.execute(select(func.count(RssFeed.id)).where(RssFeed.status == "active"))
    ).scalar() or 0
    total_articles = (await db.execute(select(func.count(Article.id)))).scalar() or 0
    total_projects = (await db.execute(select(func.count(Project.id)))).scalar() or 0
    published_projects = (
        await db.execute(select(func.count(Project.id)).where(Project.status == "published"))
    ).scalar() or 0
    total_forecasts = (await db.execute(select(func.count(ForecastSpecDB.id)))).scalar() or 0
    active_forecasts = total_forecasts  # specs with runs - simplify for now
    return DashboardStats(
        totalFeeds=total_feeds,
        activeFeeds=active_feeds,
        totalArticles=total_articles,
        pendingArticles=total_articles,  # simplify: all queued
        totalStories=total_projects,
        publishedStories=published_projects,
        totalForecasts=total_forecasts,
        activeForecasts=active_forecasts or total_forecasts,
        agentsRunning=0,
        agentsWithErrors=0,
    )


# ---------------------------------------------------------------------------
# Feeds (RssFeed)
# ---------------------------------------------------------------------------


def _feed_to_response(f: RssFeed) -> dict:
    return {
        "id": f.id,
        "name": f.name,
        "url": f.url,
        "category": f.category,
        "status": f.status,
        "articlesCount": f.articles_count,
        "lastFetched": f.last_fetched_at.isoformat() if f.last_fetched_at else None,
        "createdAt": f.created_at.isoformat() if f.created_at else None,
    }


@router.get("/feeds")
async def feeds_list(db: DbSession):
    """List all RSS feeds."""
    result = await db.execute(select(RssFeed).order_by(RssFeed.id))
    return [_feed_to_response(f) for f in result.scalars().all()]


@router.get("/feeds/{id}")
async def feeds_get(id: int, db: DbSession):
    """Get single feed."""
    r = await db.execute(select(RssFeed).where(RssFeed.id == id))
    f = r.scalar_one_or_none()
    if not f:
        raise HTTPException(status_code=404, detail="Feed not found")
    return _feed_to_response(f)


@router.post("/feeds", status_code=201)
async def feeds_create(data: FeedCreate, db: DbSession):
    """Create feed."""
    f = RssFeed(name=data.name, url=data.url, category=data.category, status=data.status or "active")
    db.add(f)
    await db.flush()
    await db.refresh(f)
    return _feed_to_response(f)


@router.put("/feeds/{id}")
async def feeds_update(id: int, data: FeedUpdate, db: DbSession):
    """Update feed."""
    r = await db.execute(select(RssFeed).where(RssFeed.id == id))
    f = r.scalar_one_or_none()
    if not f:
        raise HTTPException(status_code=404, detail="Feed not found")
    if data.name is not None:
        f.name = data.name
    if data.url is not None:
        f.url = data.url
    if data.category is not None:
        f.category = data.category
    if data.status is not None:
        f.status = data.status
    await db.flush()
    await db.refresh(f)
    return _feed_to_response(f)


@router.delete("/feeds/{id}", status_code=204)
async def feeds_delete(id: int, db: DbSession):
    """Delete feed."""
    r = await db.execute(select(RssFeed).where(RssFeed.id == id))
    f = r.scalar_one_or_none()
    if not f:
        raise HTTPException(status_code=404, detail="Feed not found")
    await db.delete(f)
    return None


# ---------------------------------------------------------------------------
# Articles
# ---------------------------------------------------------------------------


def _article_to_response(a: Article) -> dict:
    return {
        "id": a.id,
        "feedId": a.rss_item_id,
        "title": a.headline,
        "url": a.article_url,
        "sourceUrl": a.source,
        "content": (a.body or "")[:1000] if a.body else None,
        "status": "complete",
        "topics": a.topics or [],
        "entities": a.entities or [],
        "fetchedAt": a.created_at.isoformat() if a.created_at else None,
        "processedAt": a.updated_at.isoformat() if a.updated_at else None,
    }


@router.get("/articles")
async def articles_list(
    db: DbSession,
    status: Optional[str] = Query(None),
    feedId: Optional[int] = Query(None),
):
    """List articles."""
    q = select(Article).order_by(Article.id.desc())
    if feedId:
        q = q.where(Article.rss_item_id == feedId)
    result = await db.execute(q)
    return [_article_to_response(a) for a in result.scalars().all()]


@router.get("/articles/{id}")
async def articles_get(id: int, db: DbSession):
    """Get single article."""
    r = await db.execute(select(Article).where(Article.id == id))
    a = r.scalar_one_or_none()
    if not a:
        raise HTTPException(status_code=404, detail="Article not found")
    return _article_to_response(a)


@router.put("/articles/{id}")
async def articles_update(id: int, data: ArticleUpdate, db: DbSession):
    """Update article (partial)."""
    r = await db.execute(select(Article).where(Article.id == id))
    a = r.scalar_one_or_none()
    if not a:
        raise HTTPException(status_code=404, detail="Article not found")
    if data.title is not None:
        a.headline = data.title
    if data.url is not None:
        a.article_url = data.url
    if data.content is not None:
        a.body = data.content
    if data.topics is not None:
        a.topics = data.topics
    if data.entities is not None:
        a.entities = data.entities
    await db.flush()
    await db.refresh(a)
    return _article_to_response(a)


@router.delete("/articles/{id}", status_code=204)
async def articles_delete(id: int, db: DbSession):
    """Delete article."""
    r = await db.execute(select(Article).where(Article.id == id))
    a = r.scalar_one_or_none()
    if not a:
        raise HTTPException(status_code=404, detail="Article not found")
    await db.delete(a)
    return None


# ---------------------------------------------------------------------------
# Stories (Projects)
# ---------------------------------------------------------------------------


def _project_to_story(p: Project) -> dict:
    content = ""
    if p.sections:
        for s in p.sections:
            if isinstance(s, dict) and "content" in s:
                content += s.get("content", "") + "\n"
            elif isinstance(s, str):
                content += s + "\n"
    if not content and p.lede:
        content = p.lede
    return {
        "id": p.id,
        "articleId": p.origin_article_id,
        "title": p.title,
        "content": content or p.lede or "",
        "summary": p.lede,
        "status": p.status,
        "charts": p.charts or [],
        "datasets": p.datasets or [],
        "publishedAt": p.published_at.isoformat() if p.published_at else None,
        "createdAt": p.created_at.isoformat() if p.created_at else None,
    }


def _slugify(title: str) -> str:
    return "".join(c if c.isalnum() or c in "-_" else "-" for c in title.lower()).strip("-") or "story"


@router.get("/stories")
async def stories_list(db: DbSession, status: Optional[str] = Query(None)):
    """List stories (projects)."""
    q = select(Project).order_by(Project.id.desc())
    if status:
        q = q.where(Project.status == status)
    result = await db.execute(q)
    return [_project_to_story(p) for p in result.scalars().all()]


@router.get("/stories/{id}")
async def stories_get(id: int, db: DbSession):
    """Get single story."""
    r = await db.execute(select(Project).where(Project.id == id))
    p = r.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Story not found")
    return _project_to_story(p)


@router.post("/stories", status_code=201)
async def stories_create(data: StoryCreate, db: DbSession):
    """Create story (project)."""
    slug = _slugify(data.title)
    existing = await db.execute(select(Project).where(Project.slug == slug))
    if existing.scalar_one_or_none():
        slug = f"{slug}-{datetime.utcnow().strftime('%Y%m%d%H%M')}"
    p = Project(
        slug=slug,
        title=data.title,
        lede=data.summary,
        origin_article_id=data.articleId,
        sections=[{"type": "body", "content": data.content}],
        charts=data.charts or [],
        datasets=data.datasets or [],
        status=data.status,
        topic="general",
    )
    db.add(p)
    await db.flush()
    await db.refresh(p)
    return _project_to_story(p)


@router.put("/stories/{id}")
async def stories_update(id: int, data: StoryUpdate, db: DbSession):
    """Update story."""
    r = await db.execute(select(Project).where(Project.id == id))
    p = r.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Story not found")
    if data.title is not None:
        p.title = data.title
    if data.summary is not None:
        p.lede = data.summary
    if data.content is not None:
        p.sections = [{"type": "body", "content": data.content}]
    if data.status is not None:
        p.status = data.status
    if data.charts is not None:
        p.charts = data.charts
    if data.datasets is not None:
        p.datasets = data.datasets
    await db.flush()
    await db.refresh(p)
    return _project_to_story(p)


@router.patch("/stories/{id}/publish")
async def stories_publish(id: int, db: DbSession):
    """Publish story."""
    r = await db.execute(select(Project).where(Project.id == id))
    p = r.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Story not found")
    from datetime import UTC

    p.status = "published"
    p.published_at = datetime.now(UTC)
    await db.flush()
    await db.refresh(p)
    return _project_to_story(p)


@router.delete("/stories/{id}", status_code=204)
async def stories_delete(id: int, db: DbSession):
    """Delete story."""
    r = await db.execute(select(Project).where(Project.id == id))
    p = r.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Story not found")
    await db.delete(p)
    return None


# ---------------------------------------------------------------------------
# Forecasts (ForecastSpecDB + ForecastRun)
# ---------------------------------------------------------------------------


async def _forecast_to_response(db: DbSession, spec: ForecastSpecDB) -> dict:
    r = await db.execute(
        select(ForecastRun).where(ForecastRun.forecast_spec_id == spec.id).order_by(ForecastRun.run_at.desc()).limit(1)
    )
    run = r.scalar_one_or_none()
    prob_raw = 0.5
    if run and run.result and isinstance(run.result, dict):
        prob_raw = run.result.get("point_estimate", run.result.get("probability", 0.5))
    prob = round(prob_raw * 100, 1) if prob_raw <= 1 else prob_raw
    return {
        "id": spec.id,
        "storyId": spec.project_id,
        "topic": spec.topic,
        "target": spec.target,
        "probability": prob,
        "confidence": "medium",
        "modelType": "baseline",
        "horizon": spec.horizon,
        "status": "active",
        "scenarios": [],
        "lastUpdated": (run.run_at.isoformat() if run and run.run_at else None),
        "createdAt": spec.created_at.isoformat() if spec.created_at else None,
    }


@router.get("/forecasts")
async def forecasts_list(db: DbSession, status: Optional[str] = Query(None)):
    """List forecasts."""
    q = select(ForecastSpecDB).order_by(ForecastSpecDB.id.desc())
    result = await db.execute(q)
    return [await _forecast_to_response(db, s) for s in result.scalars().all()]


@router.get("/forecasts/{id}")
async def forecasts_get(id: int, db: DbSession):
    """Get single forecast."""
    r = await db.execute(select(ForecastSpecDB).where(ForecastSpecDB.id == id))
    s = r.scalar_one_or_none()
    if not s:
        raise HTTPException(status_code=404, detail="Forecast not found")
    return await _forecast_to_response(db, s)


@router.post("/forecasts", status_code=201)
async def forecasts_create(data: ForecastCreate, db: DbSession):
    """Create forecast spec + run. Admin sends probability 0-100."""
    prob = data.probability / 100.0 if data.probability > 1 else data.probability
    spec = ForecastSpecDB(
        project_id=data.storyId,
        target=data.target,
        horizon=data.horizon or "TBD",
        granularity="binary",
        constraints={},
        topic=data.topic,
    )
    db.add(spec)
    await db.flush()
    run = ForecastRun(
        project_id=data.storyId,
        forecast_spec_id=spec.id,
        model_name=data.modelType,
        result={"point_estimate": prob, "probability": prob},
        calibration_flags=[],
        metadata={},
    )
    db.add(run)
    await db.flush()
    await db.refresh(spec)
    return await _forecast_to_response(db, spec)


@router.put("/forecasts/{id}")
async def forecasts_update(id: int, data: ForecastUpdate, db: DbSession):
    """Update forecast spec."""
    r = await db.execute(select(ForecastSpecDB).where(ForecastSpecDB.id == id))
    spec = r.scalar_one_or_none()
    if not spec:
        raise HTTPException(status_code=404, detail="Forecast not found")
    if data.topic is not None:
        spec.topic = data.topic
    if data.target is not None:
        spec.target = data.target
    if data.status is not None:
        pass  # spec doesn't have status, could add
    if data.probability is not None:
        run_r = await db.execute(
            select(ForecastRun).where(ForecastRun.forecast_spec_id == spec.id).order_by(ForecastRun.run_at.desc()).limit(1)
        )
        run = run_r.scalar_one_or_none()
        if run:
            run.result = {**(run.result or {}), "point_estimate": data.probability, "probability": data.probability}
    await db.flush()
    await db.refresh(spec)
    return await _forecast_to_response(db, spec)


@router.delete("/forecasts/{id}", status_code=204)
async def forecasts_delete(id: int, db: DbSession):
    """Delete forecast (spec + runs)."""
    await db.execute(delete(ForecastRun).where(ForecastRun.forecast_spec_id == id))
    r = await db.execute(select(ForecastSpecDB).where(ForecastSpecDB.id == id))
    spec = r.scalar_one_or_none()
    if spec:
        await db.delete(spec)
    return None


# ---------------------------------------------------------------------------
# Data Sources
# ---------------------------------------------------------------------------


@router.get("/data-sources")
async def data_sources_list(db: DbSession):
    """List data sources."""
    result = await db.execute(select(DataSource).order_by(DataSource.id))
    return [{"id": d.id, "topic": d.topic, "config": d.config, "createdAt": d.created_at.isoformat() if d.created_at else None} for d in result.scalars().all()]


@router.get("/data-sources/{id}")
async def data_sources_get(id: int, db: DbSession):
    """Get data source."""
    r = await db.execute(select(DataSource).where(DataSource.id == id))
    d = r.scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=404, detail="Data source not found")
    return {"id": d.id, "topic": d.topic, "config": d.config, "createdAt": d.created_at.isoformat() if d.created_at else None}


class DataSourceCreate(BaseModel):
    topic: str
    config: Optional[dict] = None


@router.post("/data-sources", status_code=201)
async def data_sources_create(data: DataSourceCreate, db: DbSession):
    """Create data source."""
    d = DataSource(topic=data.topic, config=data.config or {})
    db.add(d)
    await db.flush()
    await db.refresh(d)
    return {"id": d.id, "topic": d.topic, "config": d.config, "createdAt": d.created_at.isoformat() if d.created_at else None}


class DataSourceUpdate(BaseModel):
    topic: Optional[str] = None
    config: Optional[dict] = None


class UserUpdate(BaseModel):
    fullName: Optional[str] = Field(None, alias="fullName")
    isActive: Optional[bool] = Field(None, alias="isActive")

    model_config = {"populate_by_name": True}


@router.put("/data-sources/{id}")
async def data_sources_update(id: int, data: DataSourceUpdate, db: DbSession):
    """Update data source."""
    r = await db.execute(select(DataSource).where(DataSource.id == id))
    d = r.scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=404, detail="Data source not found")
    if data.topic is not None:
        d.topic = data.topic
    if data.config is not None:
        d.config = data.config
    await db.flush()
    await db.refresh(d)
    return {"id": d.id, "topic": d.topic, "config": d.config, "createdAt": d.created_at.isoformat() if d.created_at else None}


@router.delete("/data-sources/{id}", status_code=204)
async def data_sources_delete(id: int, db: DbSession):
    """Delete data source."""
    r = await db.execute(select(DataSource).where(DataSource.id == id))
    d = r.scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=404, detail="Data source not found")
    await db.delete(d)
    return None


# ---------------------------------------------------------------------------
# Datasets
# ---------------------------------------------------------------------------


@router.get("/datasets")
async def datasets_list(db: DbSession, topic: Optional[str] = Query(None)):
    """List datasets."""
    q = select(Dataset).order_by(Dataset.id.desc())
    if topic:
        q = q.where(Dataset.topic == topic)
    result = await db.execute(q)
    return [{"id": d.id, "articleId": d.article_id, "topic": d.topic, "source": d.source, "createdAt": d.created_at.isoformat() if d.created_at else None} for d in result.scalars().all()]


@router.get("/datasets/{id}")
async def datasets_get(id: int, db: DbSession):
    """Get dataset."""
    r = await db.execute(select(Dataset).where(Dataset.id == id))
    d = r.scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return {"id": d.id, "articleId": d.article_id, "topic": d.topic, "data": d.data, "source": d.source, "createdAt": d.created_at.isoformat() if d.created_at else None}


@router.delete("/datasets/{id}", status_code=204)
async def datasets_delete(id: int, db: DbSession):
    """Delete dataset."""
    r = await db.execute(select(Dataset).where(Dataset.id == id))
    d = r.scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=404, detail="Dataset not found")
    await db.delete(d)
    return None


# ---------------------------------------------------------------------------
# Agents (mock - no DB)
# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------


@router.get("/users")
async def users_list(db: DbSession):
    """List users."""
    result = await db.execute(select(User).order_by(User.id))
    return [
        {"id": u.id, "email": u.email, "fullName": u.full_name, "isActive": u.is_active, "createdAt": u.created_at.isoformat() if u.created_at else None}
        for u in result.scalars().all()
    ]


@router.get("/users/{id}")
async def users_get(id: int, db: DbSession):
    """Get user."""
    r = await db.execute(select(User).where(User.id == id))
    u = r.scalar_one_or_none()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": u.id, "email": u.email, "fullName": u.full_name, "isActive": u.is_active, "createdAt": u.created_at.isoformat() if u.created_at else None}


@router.put("/users/{id}")
async def users_update(id: int, data: UserUpdate, db: DbSession):
    """Update user (partial)."""
    r = await db.execute(select(User).where(User.id == id))
    u = r.scalar_one_or_none()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    if data.fullName is not None:
        u.full_name = data.fullName
    if data.isActive is not None:
        u.is_active = data.isActive
    await db.flush()
    await db.refresh(u)
    return {"id": u.id, "email": u.email, "fullName": u.full_name, "isActive": u.is_active, "createdAt": u.created_at.isoformat() if u.created_at else None}


@router.delete("/users/{id}", status_code=204)
async def users_delete(id: int, db: DbSession):
    """Delete user."""
    r = await db.execute(select(User).where(User.id == id))
    u = r.scalar_one_or_none()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    await db.delete(u)
    return None


# ---------------------------------------------------------------------------
# Agents (mock - no DB)
# ---------------------------------------------------------------------------


@router.get("/agents")
async def agents_list():
    """List agents (placeholder - returns empty)."""
    return []


@router.get("/agents/{id}")
async def agents_get(id: int):
    """Get agent (placeholder)."""
    raise HTTPException(status_code=404, detail="Agent not found")


@router.put("/agents/{id}")
async def agents_update(id: int, data: dict):
    """Update agent (placeholder)."""
    raise HTTPException(status_code=404, detail="Agent not found")
