import os
import tempfile
import uuid
from typing import List, Optional, Tuple

from fastapi import HTTPException, UploadFile, status
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import (
    ChatGoogleGenerativeAI,
    GoogleGenerativeAIEmbeddings,
)
from langchain_text_splitters import RecursiveCharacterTextSplitter

from .db import get_supabase_client
from .llm_config import get_user_llm_config


async def ingest_pdf_to_vector_store(file: UploadFile, bot_id: str) -> Tuple[str, int]:
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="INVALID_FILE_TYPE",
        )

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="FILE_TOO_LARGE",
        )

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    loader = PyPDFLoader(tmp_path)
    docs = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=2000,
        chunk_overlap=200,
    )
    chunks = splitter.split_documents(docs)

    document_id = str(uuid.uuid4())
    for c in chunks:
        c.metadata = c.metadata or {}
        c.metadata["source"] = file.filename
        c.metadata["bot_id"] = bot_id
        c.metadata["document_id"] = document_id

    # Use API key from bot config for embeddings
    _, embeddings = _get_llm_for_bot(bot_id)
    client = get_supabase_client()

    SupabaseVectorStore.from_documents(
        documents=chunks,
        embedding=embeddings,
        client=client,
        table_name="documents",
        query_name="match_documents",
    )

    return document_id, len(chunks)


def _get_llm_for_bot(bot_id: str):
    """Return LLM and embeddings for a bot.

    In production, this prefers per-bot config stored in user_api_keys.
    For demo / local setups where that table or config may not exist,
    it falls back to GOOGLE_API_KEY or GEMINI_API_KEY from the
    environment, using a default Gemini model.
    """

    config = get_user_llm_config(bot_id)

    if config:
        if config["provider"] != "google":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ONLY_GOOGLE_GEMINI_SUPPORTED",
            )

        api_key = config["api_key"]
        # Use the exact model string from config, or default to Gemini 2.5 Flash
        model = (config.get("model") or "gemini-2.5-flash").strip()
    else:
        api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="GEMINI_API_KEY_NOT_CONFIGURED",
            )
        # Default model when no per-bot config is stored
        model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()

    llm = ChatGoogleGenerativeAI(
        model=model,
        google_api_key=api_key,
        temperature=0.2,
    )

    embeddings = GoogleGenerativeAIEmbeddings(
        model="text-embedding-004",
        api_key=api_key,
    )

    return llm, embeddings


async def chat_with_rag(
    message: str,
    context: Optional[str],
    bot_id: str,
) -> Tuple[str, List[str], float]:
    client = get_supabase_client()
    llm, embeddings = _get_llm_for_bot(bot_id)

    # --- Retrieve relevant documents via Supabase RPC directly ---
    # 1) Embed the user query
    query_embedding = embeddings.embed_query(message)

    # 2) Call the match_documents RPC in Supabase
    resp = client.rpc(
        "match_documents",
        {
            "query_embedding": query_embedding,
            "match_count": 5,
            "filter": {"bot_id": bot_id},
        },
    ).execute()

    rows = getattr(resp, "data", None) or []

    # 3) Convert rows into a lightweight document-like structure
    docs = [
        {
            "page_content": row.get("content") or "",
            "metadata": row.get("metadata") or {},
        }
        for row in rows
    ]

    prompt = ChatPromptTemplate.from_template(
        """You are a helpful and friendly support assistant for Ethiopian government services.

IMPORTANT INSTRUCTIONS:
- Respond in a warm, human-like, and conversational manner
- Use ONLY the information provided in the context below - NEVER use general knowledge
- If the answer is not in the context, politely say you don't have that information
- Detect the language the user is using and respond in the SAME language (Amharic, English, Oromo, or Tigrinya)
- For the FIRST message only, greet users in both Amharic (ሰላም) and Oromo (Nagaa). After that, skip greetings.
- When writing in Amharic or Oromo or Tigrinya, use ONLY Amharic or Oromo or Tigrinya - do not mix English or add English translations in parentheses
- Similarly, keep each language pure without mixing or translating

Context:
{context}

Extra_user_context:
{extra_context}

Question:
{input}

Remember: Be helpful, friendly, and only use the provided context. Respond purely in the user's language without mixing."""
    )

    # 4) Build context string from retrieved documents
    context_text = "\n\n".join(d["page_content"] for d in docs)

    # 5) Format prompt messages and call the LLM directly
    messages = prompt.format_messages(
        context=context_text,
        extra_context=context or "",
        input=message,
    )

    response = llm.invoke(messages)
    answer = getattr(response, "content", str(response))
    sources = sorted(
        {
            d["metadata"].get("source")
            for d in docs
            if d["metadata"].get("source")
        }
    )

    confidence = 0.95 if docs else 0.0
    return answer, sources, confidence
