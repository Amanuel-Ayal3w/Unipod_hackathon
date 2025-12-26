from fastapi import FastAPI

from .routers import chat, config, health, ingest


app = FastAPI(title="SupportBot AI Backend", version="1.1")


app.include_router(health.router, tags=["health"])
app.include_router(ingest.router, prefix="/ingest", tags=["ingestion"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(config.router, prefix="/api/chatbot", tags=["chatbot-config"])