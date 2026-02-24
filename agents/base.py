"""Agent interface and call pattern for pipeline handoffs."""

from abc import ABC, abstractmethod
from typing import Any

from schemas.pipeline import ProjectContext


class BaseAgent(ABC):
    """Base class for pipeline agents. Each agent receives and returns ProjectContext."""

    name: str = "base"

    @abstractmethod
    async def run(self, context: ProjectContext) -> ProjectContext:
        """Execute agent logic. Receives context, returns updated context."""
        pass

    async def __call__(self, context: ProjectContext) -> ProjectContext:
        """Allow agents to be called as context.run()."""
        return await self.run(context)


def agent_run(agent: BaseAgent, context: ProjectContext) -> ProjectContext:
    """Synchronous wrapper for testing (use await agent.run() in async code)."""
    import asyncio
    return asyncio.run(agent.run(context))
