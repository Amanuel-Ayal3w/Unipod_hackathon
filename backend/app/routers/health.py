from fastapi import APIRouter


router = APIRouter()


@router.get("/health")
async def health_check() -> dict:
    return {
        "status": "healthy",
        "version": "1.1",
        "database": "unknown",
        "vector_db": "unknown",
    }
