import os
from textwrap import dedent

import psycopg2
from dotenv import load_dotenv


def main() -> None:
    load_dotenv()

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is not set in .env")

    ddl = dedent(
        """
        -- Enable pgvector
        create extension if not exists vector;

        -- Documents table used by RAG
        create table if not exists documents (
          id uuid primary key default uuid_generate_v4(),
          content text not null,
          metadata jsonb not null,
          embedding vector(768),
          created_at timestamp default now()
        );

        create index if not exists documents_embedding_ivfflat
        on documents using ivfflat (embedding vector_cosine_ops);

        -- User API keys table for per-bot Gemini config
        create table if not exists user_api_keys (
          id uuid primary key default uuid_generate_v4(),
          bot_id uuid,
          provider text not null,
          api_key_encrypted text not null,
          model text not null,
          is_active boolean default true,
          created_at timestamp default now(),
          updated_at timestamp default now()
        );

        create index if not exists idx_user_api_keys_bot_provider
        on user_api_keys (bot_id, provider);

        -- match_documents RPC for SupabaseVectorStore
        create or replace function match_documents (
          query_embedding vector(768),
          match_count int default 5,
          filter jsonb default '{}'::jsonb
        )
        returns table (
          id uuid,
          content text,
          metadata jsonb,
          similarity float
        )
        language plpgsql
        as $$
        begin
          return query
          select
            d.id,
            d.content,
            d.metadata,
            1 - (d.embedding <=> query_embedding) as similarity
          from documents d
          where
            (filter ? 'bot_id' is false or d.metadata->>'bot_id' = filter->>'bot_id')
          order by d.embedding <=> query_embedding
          limit match_count;
        end;
        $$;
        """
    )

    print("Connecting to database...")
    with psycopg2.connect(database_url) as conn:
        with conn.cursor() as cur:
            cur.execute(ddl)
        conn.commit()
    print("Migration completed successfully.")


if __name__ == "__main__":
    main()
