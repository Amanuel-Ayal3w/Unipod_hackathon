from datetime import datetime
from typing import List

from pydantic import BaseModel


class IngestResponse(BaseModel):
    success: bool
    message: str
    document_id: str
    chunks_created: int


class DocumentItem(BaseModel):
    document_id: str
    source: str
    created_at: datetime


class ListDocumentsResponse(BaseModel):
    items: List[DocumentItem]
