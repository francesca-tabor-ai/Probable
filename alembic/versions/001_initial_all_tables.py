"""Initial schema — all tables

Revision ID: 001_initial
Revises:
Create Date: 2025-02-24

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "rss_items",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("url", sa.String(length=2048), nullable=False),
        sa.Column("guid", sa.String(length=512), nullable=True),
        sa.Column("title", sa.String(length=1024), nullable=False),
        sa.Column("body", sa.Text(), nullable=True),
        sa.Column("raw_html", sa.Text(), nullable=True),
        sa.Column("source", sa.String(length=256), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("fetched_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("processed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("article_id", sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_rss_items_guid"), "rss_items", ["guid"], unique=False)
    op.create_index(op.f("ix_rss_items_source"), "rss_items", ["source"], unique=False)
    op.create_index(op.f("ix_rss_items_url"), "rss_items", ["url"], unique=True)

    op.create_table(
        "articles",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("rss_item_id", sa.Integer(), nullable=True),
        sa.Column("headline", sa.String(length=1024), nullable=False),
        sa.Column("dek", sa.String(length=512), nullable=True),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("article_url", sa.String(length=2048), nullable=False),
        sa.Column("source", sa.String(length=256), nullable=False),
        sa.Column("topics", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("entities", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("key_numbers", sa.JSON(), nullable=True),
        sa.Column("quotes", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_articles_article_url"), "articles", ["article_url"], unique=False)
    op.create_index(op.f("ix_articles_source"), "articles", ["source"], unique=False)

    op.create_table(
        "data_sources",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("topic", sa.String(length=128), nullable=False),
        sa.Column("config", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_data_sources_topic"), "data_sources", ["topic"], unique=True)

    op.create_table(
        "datasets",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("article_id", sa.Integer(), nullable=True),
        sa.Column("topic", sa.String(length=128), nullable=False),
        sa.Column("data", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("s3_key", sa.String(length=512), nullable=True),
        sa.Column("source", sa.String(length=256), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_datasets_topic"), "datasets", ["topic"], unique=False)

    op.create_table(
        "projects",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("slug", sa.String(length=256), nullable=False),
        sa.Column("title", sa.String(length=512), nullable=False),
        sa.Column("lede", sa.Text(), nullable=True),
        sa.Column("origin_article_id", sa.Integer(), nullable=True),
        sa.Column("sections", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("charts", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("datasets", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("methodology", sa.Text(), nullable=True),
        sa.Column("forecast_block", sa.JSON(), nullable=True),
        sa.Column("status", sa.String(length=64), nullable=False, server_default="draft"),
        sa.Column("topic", sa.String(length=128), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_projects_slug"), "projects", ["slug"], unique=True)
    op.create_index(op.f("ix_projects_status"), "projects", ["status"], unique=False)
    op.create_index(op.f("ix_projects_topic"), "projects", ["topic"], unique=False)

    op.create_table(
        "forecast_specs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("project_id", sa.Integer(), nullable=True),
        sa.Column("article_id", sa.Integer(), nullable=True),
        sa.Column("target", sa.String(length=512), nullable=False),
        sa.Column("horizon", sa.String(length=256), nullable=False),
        sa.Column("granularity", sa.String(length=64), nullable=False),
        sa.Column("constraints", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("topic", sa.String(length=128), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_forecast_specs_topic"), "forecast_specs", ["topic"], unique=False)

    op.create_table(
        "forecast_runs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("project_id", sa.Integer(), nullable=True),
        sa.Column("forecast_spec_id", sa.Integer(), nullable=True),
        sa.Column("model_name", sa.String(length=128), nullable=False),
        sa.Column("result", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("calibration_flags", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("run_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("metadata", sa.JSON(), nullable=False, server_default="{}"),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("forecast_runs")
    op.drop_table("forecast_specs")
    op.drop_table("projects")
    op.drop_table("datasets")
    op.drop_table("data_sources")
    op.drop_table("articles")
    op.drop_table("rss_items")
