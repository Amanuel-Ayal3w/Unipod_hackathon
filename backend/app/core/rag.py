import os
import tempfile
import uuid
from typing import List, Optional, Tuple

from fastapi import HTTPException, UploadFile, status
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
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

    embeddings = GoogleGenerativeAIEmbeddings(model="text-embedding-004")
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
    config = get_user_llm_config(bot_id)
    if not config:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="LLM_CONFIG_NOT_FOUND",
        )

    if config["provider"] != "google":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ONLY_GOOGLE_GEMINI_SUPPORTED",
        )

    api_key = config["api_key"]
    model = config.get("model") or "gemini-1.5-flash"

    llm = ChatGoogleGenerativeAI(
        model=model,
        google_api_key=api_key,
        temperature=0.2,
    )
    embeddings = GoogleGenerativeAIEmbeddings(model="text-embedding-004")
    return llm, embeddings


async def chat_with_rag(
    message: str,
    context: Optional[str],
    bot_id: str,
) -> Tuple[str, List[str], float]:
    client = get_supabase_client()
    llm, embeddings = _get_llm_for_bot(bot_id)

    vector_store = SupabaseVectorStore(
        client=client,
        embedding=embeddings,
        table_name="documents",
        query_name="match_documents",
    )

    retriever = vector_store.as_retriever(
        search_kwargs={"k": 5, "filter": {"bot_id": bot_id}},
    )

    prompt = ChatPromptTemplate.from_template(
        """You are a helpful support assistant for Ethiopian government services.\nUse ONLY the provided context to answer.\n\nContext:\n{context}\n\nExtra_user_context:\n{extra_context}\n\nQuestion:\n{input}\n\nIf the answer is not in the context, say you don't know."""
    )

    document_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, document_chain)

    result = rag_chain.invoke(
        {
            "input": message,
            "extra_context": context or "",
        }
    )

    answer = result.get("answer", "")
    docs = result.get("context", [])
    sources = sorted(
        {
            d.metadata.get("source")
            for d in docs
            if d.metadata.get("source")
        }
    )

    confidence = 0.95 if docs else 0.0
    return answer, sources, confidence
