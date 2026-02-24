"""Add rss_feeds table for admin

Revision ID: 003_rss_feeds
Revises: 002_users
Create Date: 2025-02-24

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "003_rss_feeds"
down_revision: Union[str, None] = "002_users"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "rss_feeds",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=256), nullable=False),
        sa.Column("url", sa.String(length=2048), nullable=False),
        sa.Column("category", sa.String(length=128), nullable=False),
        sa.Column("status", sa.String(length=64), nullable=False, server_default="active"),
        sa.Column("articles_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_fetched_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_rss_feeds_category"), "rss_feeds", ["category"], unique=False)
    op.create_index(op.f("ix_rss_feeds_url"), "rss_feeds", ["url"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_rss_feeds_url"), table_name="rss_feeds")
    op.drop_index(op.f("ix_rss_feeds_category"), table_name="rss_feeds")
    op.drop_table("rss_feeds")
