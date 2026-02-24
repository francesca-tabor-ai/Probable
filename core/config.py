"""Probable.news configuration from environment variables."""

from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # App
    app_name: str = "Probable.news"
    debug: bool = False

    # Database
    database_url: str = "postgresql+asyncpg://probable:probable@localhost:5432/probable"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # LLM
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-4o-mini"

    # Storage (S3-compatible)
    s3_endpoint_url: Optional[str] = None
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    s3_bucket: str = "probable-storage"
    s3_region: str = "us-east-1"

    # RSS Feeds (comma-separated URLs)
    rss_feeds: str = "https://feeds.bbci.co.uk/news/politics/rss.xml,https://www.theguardian.com/politics/rss"

    # Poll data (Wikipedia or API - placeholder)
    uk_polls_url: Optional[str] = None
    uk_election_results_url: Optional[str] = None


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance."""
    return Settings()
