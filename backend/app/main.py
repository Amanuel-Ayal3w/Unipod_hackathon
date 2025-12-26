from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import chat, config, health, ingest


app = FastAPI(title="SupportBot AI Backend", version="1.1")

origins = [
	"http://localhost:3000",
	"http://127.0.0.1:3000",
]

app.add_middleware(
	CORSMiddleware,
	allow_origins=origins,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


app.include_router(health.router, tags=["health"])
app.include_router(ingest.router, prefix="/ingest", tags=["ingestion"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(config.router, prefix="/api/chatbot", tags=["chatbot-config"])