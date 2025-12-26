from fastapi import APIRouter, Depends, File, Form, UploadFile

from ..dependencies.auth import get_current_admin
from ..schemas.ingest import IngestResponse, ListDocumentsResponse, DocumentItem
from ..core.rag import ingest_pdf_to_vector_store
from ..core.db import get_supabase_client


router = APIRouter()


@router.post("", response_model=IngestResponse)
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


@router.get("/documents", response_model=ListDocumentsResponse)
async def list_documents(current_admin: dict = Depends(get_current_admin)) -> ListDocumentsResponse:
    """List unique uploaded documents for the current (demo) bot.

    Groups by document_id and source using the documents table.
    """

    bot_id = current_admin.get("bot_id")
    client = get_supabase_client()

    # Select distinct document_id/source pairs for this bot
    resp = (
        client.table("documents")
        .select("document_id:metadata->>document_id, source:metadata->>source, created_at")
        .eq("metadata->>bot_id", bot_id)
        .order("created_at", desc=True)
        .execute()
    )

    rows = getattr(resp, "data", None) or []

    seen = set()
    items: list[DocumentItem] = []
    for row in rows:
        doc_id = row.get("document_id")
        source = row.get("source") or "Unknown"
        key = (doc_id, source)
        if doc_id and key not in seen:
            seen.add(key)
            items.append(
                DocumentItem(
                    document_id=doc_id,
                    source=source,
                    created_at=row.get("created_at"),
                )
            )

    return ListDocumentsResponse(items=items)
