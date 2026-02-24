"""ARQ worker entrypoint."""

import asyncio

from arq import create_pool
from arq.connections import RedisSettings

from core.config import get_settings

settings = get_settings()


async def startup(ctx: dict):
    """Worker startup: connect to Redis and DB."""
    ctx["redis"] = await create_pool(RedisSettings.from_url(settings.redis_url))


async def shutdown(ctx: dict):
    """Worker shutdown."""
    if "redis" in ctx:
        await ctx["redis"].close()


# Worker functions will be registered here as the orchestration is built
async def sample_task(ctx: dict, msg: str) -> str:
    """Sample task for testing worker setup."""
    return f"Processed: {msg}"


class WorkerSettings:
    """ARQ worker configuration."""

    functions = [sample_task]
    on_startup = startup
    on_shutdown = shutdown
    redis_settings = RedisSettings.from_url(settings.redis_url)
    max_jobs = 10
    job_timeout = 300


if __name__ == "__main__":
    from arq import run_worker

    asyncio.run(run_worker(WorkerSettings))
