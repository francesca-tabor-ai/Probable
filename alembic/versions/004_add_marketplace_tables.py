"""Add marketplace_apps and user_app_integrations tables

Revision ID: 004_marketplace
Revises: 003_rss_feeds
Create Date: 2025-02-24

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "004_marketplace"
down_revision: Union[str, None] = "003_rss_feeds"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "marketplace_apps",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("slug", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=256), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=64), nullable=False),
        sa.Column("icon", sa.String(length=8), nullable=False, server_default="?"),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("workflows", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("config_schema", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_marketplace_apps_category"), "marketplace_apps", ["category"], unique=False)
    op.create_index(op.f("ix_marketplace_apps_slug"), "marketplace_apps", ["slug"], unique=True)

    op.create_table(
        "user_app_integrations",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("app_id", sa.Integer(), nullable=False),
        sa.Column("config", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="active"),
        sa.Column("last_sync_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_user_app_integrations_app_id"), "user_app_integrations", ["app_id"], unique=False)
    op.create_index(op.f("ix_user_app_integrations_user_id"), "user_app_integrations", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_user_app_integrations_user_id"), table_name="user_app_integrations")
    op.drop_index(op.f("ix_user_app_integrations_app_id"), table_name="user_app_integrations")
    op.drop_table("user_app_integrations")
    op.drop_index(op.f("ix_marketplace_apps_slug"), table_name="marketplace_apps")
    op.drop_index(op.f("ix_marketplace_apps_category"), table_name="marketplace_apps")
    op.drop_table("marketplace_apps")
