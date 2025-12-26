from pydantic import BaseModel


class IngestResponse(BaseModel):
    success: bool
    message: str
    document_id: str
    chunks_created: int
