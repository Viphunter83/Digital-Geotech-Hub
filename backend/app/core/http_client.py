import httpx
from typing import Optional

class HTTPClientManager:
    client: Optional[httpx.AsyncClient] = None

    def start(self):
        self.client = httpx.AsyncClient(timeout=10.0)

    async def stop(self):
        if self.client:
            await self.client.aclose()
            self.client = None

http_manager = HTTPClientManager()
