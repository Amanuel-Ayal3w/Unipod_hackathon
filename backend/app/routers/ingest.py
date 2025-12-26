from fastapi import APIRouter, Depends, File, Form, UploadFile

from ..dependencies.auth import get_current_admin
from ..schemas.ingest import IngestResponse
from ..core.rag import ingest_pdf_to_vector_store


router = APIRouter()


@router.post("/", response_model=IngestResponse)
async def ingest_document(
    file: UploadFile = File(...),
    bot_id: str | None = Form(None),
    current_admin: dict = Depends(get_current_admin),
) -> IngestResponse:
    effective_bot_id = bot_id or current_admin.get("bot_id")
    document_id, chunks_created = await ingest_pdf_to_vector_store(
        file=file,
        bot_id=effective_bot_id,
    )

    return IngestResponse(
        success=True,
        message="Document processed successfully",
        document_id=document_id,
        chunks_created=chunks_created,
    )
