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
from models.marketplace import MarketplaceApp
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


MARKETPLACE_APPS = [
    {
        "slug": "google-sheets",
        "name": "Google Sheets",
        "description": "Import forecasts and probability distributions directly from Sheets. Auto-sync your spreadsheets as data sources.",
        "category": "data",
        "icon": "G",
        "sort_order": 1,
        "workflows": [
            {"id": "sync-in", "name": "Sync data in", "description": "Pull spreadsheet data as forecast inputs"},
            {"id": "sync-out", "name": "Export forecasts", "description": "Push probability outputs to a sheet"},
        ],
        "config_schema": {"type": "oauth", "scopes": ["spreadsheets"]},
    },
    {
        "slug": "bigquery",
        "name": "BigQuery",
        "description": "Query your data warehouse in real time. Run probabilistic models on BigQuery datasets and push results back.",
        "category": "data",
        "icon": "BQ",
        "sort_order": 2,
        "workflows": [
            {"id": "query-forecast", "name": "Forecast on query", "description": "Run forecasts on BigQuery table data"},
            {"id": "write-results", "name": "Write results", "description": "Export forecast distributions to BigQuery"},
        ],
        "config_schema": {"type": "service_account"},
    },
    {
        "slug": "snowflake",
        "name": "Snowflake",
        "description": "Connect to Snowflake for enterprise data. Pull time-series data for forecasting and write probability outputs.",
        "category": "data",
        "icon": "S",
        "sort_order": 3,
        "workflows": [
            {"id": "ingest", "name": "Ingest time series", "description": "Use Snowflake tables as forecast inputs"},
        ],
        "config_schema": {"type": "credentials"},
    },
    {
        "slug": "airtable",
        "name": "Airtable",
        "description": "Sync Airtable bases as forecast inputs. Map bases to datasets and keep your no-code workflows in sync.",
        "category": "data",
        "icon": "A",
        "sort_order": 4,
        "workflows": [
            {"id": "base-sync", "name": "Base sync", "description": "Sync a base as a dataset source"},
        ],
        "config_schema": {"type": "oauth"},
    },
    {
        "slug": "slack",
        "name": "Slack",
        "description": "Send forecast alerts and probability updates to channels. Get notified when confidence drops below thresholds.",
        "category": "communication",
        "icon": "S",
        "sort_order": 10,
        "workflows": [
            {"id": "alerts", "name": "Forecast alerts", "description": "Post to channel when forecasts cross thresholds"},
            {"id": "digest", "name": "Daily digest", "description": "Daily summary of key probabilities"},
        ],
        "config_schema": {"type": "oauth", "fields": [{"key": "channel_id", "label": "Default channel"}]},
    },
    {
        "slug": "microsoft-teams",
        "name": "Microsoft Teams",
        "description": "Post forecast summaries and risk updates to Teams. Share probabilistic dashboards with your org.",
        "category": "communication",
        "icon": "M",
        "sort_order": 11,
        "workflows": [
            {"id": "teams-post", "name": "Post to channel", "description": "Share forecast cards in Teams"},
        ],
        "config_schema": {"type": "webhook", "fields": [{"key": "webhook_url", "label": "Incoming webhook URL"}]},
    },
    {
        "slug": "zapier",
        "name": "Zapier",
        "description": "Trigger forecasts from any Zapier event. Send probability outputs to 5,000+ apps. Build chains without code.",
        "category": "automation",
        "icon": "Z",
        "sort_order": 20,
        "workflows": [
            {"id": "trigger", "name": "Trigger on event", "description": "Run forecast when Zapier detects an event"},
            {"id": "action", "name": "Zapier action", "description": "Send forecast to any Zapier app"},
        ],
        "config_schema": {"type": "api_key"},
    },
    {
        "slug": "make",
        "name": "Make",
        "description": "Use Probable in Make scenarios. Run forecasts on schedule, transform outputs, and automate downstream workflows.",
        "category": "automation",
        "icon": "M",
        "sort_order": 21,
        "workflows": [
            {"id": "scheduled", "name": "Scheduled forecast", "description": "Run forecast on a schedule"},
            {"id": "webhook", "name": "Webhook trigger", "description": "Trigger from Make webhook"},
        ],
        "config_schema": {"type": "api_key"},
    },
    {
        "slug": "n8n",
        "name": "n8n",
        "description": "Self-hosted automation. Connect Probable to n8n workflows for custom pipelines and on-premise integrations.",
        "category": "automation",
        "icon": "n",
        "sort_order": 22,
        "workflows": [
            {"id": "n8n-node", "name": "n8n node", "description": "Probable node in your workflow"},
        ],
        "config_schema": {"type": "api_key"},
    },
    {
        "slug": "looker",
        "name": "Looker",
        "description": "Embed probability dashboards in Looker. Combine Probable forecasts with your existing BI reports.",
        "category": "bi",
        "icon": "L",
        "sort_order": 30,
        "workflows": [
            {"id": "embed", "name": "Embed dashboard", "description": "Embed Probable viz in Looker"},
        ],
        "config_schema": {"type": "sso"},
    },
    {
        "slug": "tableau",
        "name": "Tableau",
        "description": "Export forecast distributions to Tableau. Visualise confidence intervals and scenario analyses in your dashboards.",
        "category": "bi",
        "icon": "T",
        "sort_order": 31,
        "workflows": [
            {"id": "export", "name": "Export to Tableau", "description": "Push probability data to Tableau"},
        ],
        "config_schema": {"type": "api_key"},
    },
    {
        "slug": "power-bi",
        "name": "Power BI",
        "description": "Push probabilistic metrics to Power BI. Build reports that show full outcome distributions, not just point estimates.",
        "category": "bi",
        "icon": "P",
        "sort_order": 32,
        "workflows": [
            {"id": "powerbi-push", "name": "Push to Power BI", "description": "Stream forecast data to Power BI"},
        ],
        "config_schema": {"type": "api_key"},
    },
]


async def seed_marketplace_apps(session) -> int:
    """Seed marketplace apps. Idempotent."""
    count = 0
    for app_data in MARKETPLACE_APPS:
        existing = await session.execute(
            select(MarketplaceApp).where(MarketplaceApp.slug == app_data["slug"])
        )
        if existing.scalar_one_or_none() is not None:
            continue
        session.add(
            MarketplaceApp(
                slug=app_data["slug"],
                name=app_data["name"],
                description=app_data["description"],
                category=app_data["category"],
                icon=app_data["icon"],
                sort_order=app_data["sort_order"],
                workflows=app_data["workflows"],
                config_schema=app_data["config_schema"],
                is_active=True,
            )
        )
        count += 1
    return count


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

            n_m = await seed_marketplace_apps(session)
            print(f"  Marketplace apps: {n_m} added")

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
