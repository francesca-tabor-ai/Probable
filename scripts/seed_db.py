#!/usr/bin/env python3
"""Seed the database with initial data. Run after alembic upgrade head."""

import asyncio
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select

from core.config import get_settings
from core.db import async_session_maker
from core.auth import get_password_hash
from models.article import Article
from models.rss_feed import RssFeed
from models.user import User
from models.dataset import DataSource, Dataset
from models.forecast import ForecastRun, ForecastSpecDB
from models.project import Project
from models.rss import RssItem


async def seed_data_sources(session) -> int:
    """Seed data sources from RSS feeds config (one per unique topic)."""
    settings = get_settings()
    feeds = [f.strip() for f in settings.rss_feeds.split(",") if f.strip()]
    seen_topics: set[str] = set()
    count = 0
    for url in feeds:
        topic = "politics"
        if "business" in url.lower():
            topic = "business"
        elif "tech" in url.lower():
            topic = "technology"
        if topic in seen_topics:
            continue
        seen_topics.add(topic)

        existing = await session.execute(select(DataSource).where(DataSource.topic == topic))
        if existing.scalar_one_or_none() is None:
            session.add(
                DataSource(
                    topic=topic,
                    config={"rss_feeds": feeds, "default_feed": url},
                )
            )
            count += 1
    return count


# Default admin credentials (development only)
ADMIN_EMAIL = "admin@probable.local"
ADMIN_PASSWORD = "Admin123!"


async def seed_admin_user(session) -> int:
    """Seed an admin user for dashboard access."""
    existing = await session.execute(select(User).where(User.email == ADMIN_EMAIL))
    if existing.scalar_one_or_none() is not None:
        return 0
    session.add(
        User(
            email=ADMIN_EMAIL,
            hashed_password=get_password_hash(ADMIN_PASSWORD),
            full_name="Admin",
            is_active=True,
        )
    )
    return 1


async def seed_sample_feed(session) -> int:
    """Seed a sample RSS feed for admin."""
    existing = await session.execute(
        select(RssFeed).where(RssFeed.url == "https://feeds.bbci.co.uk/news/politics/rss.xml")
    )
    if existing.scalar_one_or_none() is not None:
        return 0
    session.add(
        RssFeed(
            name="BBC Politics",
            url="https://feeds.bbci.co.uk/news/politics/rss.xml",
            category="politics",
            status="active",
        )
    )
    return 1


async def seed_sample_article(session) -> int | None:
    """Seed a sample article and linked RSS item."""
    existing = await session.execute(
        select(Article).where(Article.article_url == "https://example.com/sample-uk-election-forecast")
    )
    if existing.scalar_one_or_none() is not None:
        return None

    rss = RssItem(
        url="https://example.com/sample-uk-election-forecast",
        guid="sample-guid-001",
        title="Sample: UK election outcome probability",
        body="A sample article for development. What is the probability Labour wins a majority?",
        source="Probable Seed",
    )
    session.add(rss)
    await session.flush()

    article = Article(
        rss_item_id=rss.id,
        headline="Sample: UK election outcome probability",
        dek="Development seed data for forecast pipeline.",
        body="This is sample content. The forecast pipeline will ingest real articles and produce probabilistic forecasts.",
        article_url="https://example.com/sample-uk-election-forecast",
        source="Probable Seed",
        topics=["politics", "uk-election"],
        entities=["Labour", "Conservative", "UK"],
    )
    session.add(article)
    await session.flush()

    rss.article_id = article.id
    return article.id


async def seed_sample_project(session, article_id: int | None) -> int | None:
    """Seed a sample project."""
    existing = await session.execute(select(Project).where(Project.slug == "sample-uk-election-2025"))
    if existing.scalar_one_or_none() is not None:
        return None

    project = Project(
        slug="sample-uk-election-2025",
        title="UK General Election 2025 — Outcome Probability",
        lede="A probabilistic forecast of the next UK general election outcome.",
        origin_article_id=article_id,
        sections=[{"type": "intro", "content": "Sample analysis section."}],
        charts=[{"type": "bar", "title": "Seat distribution (sample)"}],
        datasets=[],
        status="draft",
        topic="politics",
    )
    session.add(project)
    await session.flush()
    return project.id


async def seed_sample_forecast(session, project_id: int | None) -> int:
    """Seed a sample forecast spec and run."""
    existing = await session.execute(
        select(ForecastSpecDB).where(ForecastSpecDB.target == "Labour majority (326+ seats)")
    )
    if existing.scalar_one_or_none() is not None:
        return 0

    spec = ForecastSpecDB(
        project_id=project_id,
        target="Labour majority (326+ seats)",
        horizon="2025 general election",
        granularity="binary",
        constraints={"min_seats": 326},
        topic="politics",
    )
    session.add(spec)
    await session.flush()

    run = ForecastRun(
        project_id=project_id,
        forecast_spec_id=spec.id,
        model_name="baseline",
        result={
            "point_estimate": 0.62,
            "ci_low": 0.48,
            "ci_high": 0.75,
            "distribution": "beta",
        },
        calibration_flags=[],
        metadata={"seed": True},
    )
    session.add(run)
    return 1


async def seed_sample_dataset(session, article_id: int | None) -> int:
    """Seed a sample dataset."""
    existing = await session.execute(
        select(Dataset).where(Dataset.topic == "politics").limit(1)
    )
    if existing.scalar_one_or_none() is not None:
        return 0

    session.add(
        Dataset(
            article_id=article_id,
            topic="politics",
            data={
                "poll_avg": 0.42,
                "sample_size": 1000,
                "sources": ["YouGov", "Ipsos"],
            },
            source="Probable Seed",
        )
    )
    return 1


async def run_seed():
    """Run all seed functions."""
    async with async_session_maker() as session:
        try:
            n_admin = await seed_admin_user(session)
            print(f"  Admin user: {'added' if n_admin else 'skipped (exists)'}")

            n_ds = await seed_data_sources(session)
            print(f"  Data sources: {n_ds} added")

            n_f = await seed_sample_feed(session)
            print(f"  RSS feeds: {n_f} added")

            art_id = await seed_sample_article(session)
            print(f"  Article: {'added' if art_id else 'skipped (exists)'}")

            proj_id = await seed_sample_project(session, art_id)
            print(f"  Project: {'added' if proj_id else 'skipped (exists)'}")

            n_fc = await seed_sample_forecast(session, proj_id)
            print(f"  Forecast spec + run: {n_fc} added")

            n_d = await seed_sample_dataset(session, art_id)
            print(f"  Dataset: {n_d} added")

            await session.commit()
            print("Seed complete.")
        except Exception as e:
            await session.rollback()
            raise e


def main():
    print("Seeding database...")
    asyncio.run(run_seed())


if __name__ == "__main__":
    main()
