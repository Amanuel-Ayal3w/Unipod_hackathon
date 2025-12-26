# Backend Requirements

**Software Requirements Specification (SRS) - Backend Subsystem: SupportBot AI**  
**Version: 1.1 (Gemini Update)**  
**Team: Lasta**  
**Date: December 25, 2025**

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to define the functional and non-functional requirements for the backend of the SupportBot AI platform. This subsystem is responsible for data ingestion, vector management, and the Retrieval Augmented Generation (RAG) pipeline that powers the customer support chatbots for Ethiopian Government services.

### 1.2 Scope
The backend system acts as the intermediary between the Next.js Dashboard (Admin Interface), the JavaScript Widget (Client Interface), and the Supabase Database. It handles:
- Secure authentication for admins and API verification for widgets
- Parsing and vectorization of official government documents (PDFs)
- Semantic search retrieval using LangChain
- AI response generation using Google Gemini models

### 1.3 Definitions & Acronyms
- **RAG (Retrieval Augmented Generation)**: A technique that retrieves relevant documents to ground the LLM's answer in factual data
- **Embeddings**: Vector representations of text used for semantic search
- **Multi-tenancy**: The architectural ability to serve multiple government offices (tenants) from a single database while keeping their data isolated

## 2. Overall Description

### 2.1 Product Perspective
This backend operates as a RESTful API service built on FastAPI. It relies on Supabase for persistent storage (Relational + Vector) and Google Gemini for inference. It is designed to be stateless and horizontally scalable.

### 2.2 System Architecture
The system follows a Service-Oriented Architecture (SOA):
- **API Layer**: FastAPI (Python) handles request validation and routing
- **Logic Layer**: LangChain orchestrates the parsing, chunking, and retrieval logic
- **Data Layer**: Supabase (PostgreSQL) stores user profiles, API keys, and document vectors via the pgvector extension

## 3. System Features (Functional Requirements)

### 3.1 Authentication & Authorization
**Description**: The system must verify the identity of dashboard users and the validity of widget API keys.

- **FR-01**: The system shall validate Supabase JWTs (JSON Web Tokens) for all protected administrative routes (e.g., `/ingest`)
- **FR-02**: The system shall validate custom `x-api-key` headers for public chat routes, linking the request to a specific `bot_id`
- **FR-03**: The system shall deny access to resources (documents) that do not belong to the authenticated user's `bot_id` (Data Isolation)

### 3.2 Document Ingestion Pipeline
**Description**: The system must process uploaded files into searchable vector indices.

- **FR-04 (Parsing)**: The system shall accept PDF files via the `/ingest` endpoint and extract text using LangChain `PyPDFLoader`
- **FR-05 (Chunking)**: The system shall split extracted text into semantic chunks using LangChain `RecursiveCharacterTextSplitter`. **Note**: Target chunk size may be increased to 2000 characters to leverage Gemini's larger context window
- **FR-06 (Embedding)**: The system shall generate vector embeddings for each text chunk using the Google `text-embedding-004` model
- **FR-07 (Storage)**: The system shall store the text content, vector embedding, and metadata (filename, bot_id) into the Supabase `documents` table

### 3.3 Retrieval Augmented Generation (Chat)
**Description**: The system must generate accurate answers based strictly on uploaded documents.

- **FR-08 (Vector Search)**: Upon receiving a user query, the system shall convert the query into a vector and perform a cosine similarity search in Supabase
- **FR-09 (Filtering)**: The search function must apply a metadata filter (`filter: { bot_id: ... }`) to ensure only the specific government office's documents are searched
- **FR-10 (Generation)**: The system shall use LangChain's `create_retrieval_chain` to pass the retrieved context and user query to the user's configured LLM model (using their stored API key)
- **FR-11 (Citation)**: The system shall return a list of unique source filenames used to generate the answer
- **FR-12 (User API Keys)**: The system shall store and use user-provided LLM API keys (OpenAI, Anthropic, Google) per bot_id, allowing users to use their own API credits without backend environment configuration

## 4. External Interface Requirements

### 4.1 API Endpoints

The backend shall expose the following REST endpoints:

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/ingest` | Uploads PDF, parses, and indexes vectors | Bearer Token (JWT) |
| POST | `/chat` | Accepts user questions, returns AI response + sources | x-api-key |
| PUT | `/api/chatbot/config` | Store user's LLM API key and model preference | Bearer Token (JWT) |
| GET | `/api/chatbot/config` | Get user's LLM configuration | Bearer Token (JWT) |
| GET | `/health` | Returns service status | None |

#### 4.1.1 `/ingest` Endpoint

**Request:**
```http
POST /ingest
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

{
  "file": <PDF_FILE>,
  "bot_id": "string" (optional, extracted from JWT)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Document processed successfully",
  "document_id": "uuid",
  "chunks_created": 42
}
```

#### 4.1.2 `/chat` Endpoint

**Request:**
```http
POST /chat
x-api-key: <API_KEY>
Content-Type: application/json

{
  "message": "User question here",
  "context": "optional context"
}
```

**Response:**
```json
{
  "response": "AI generated response",
  "sources": ["document1.pdf", "document2.pdf"],
  "confidence": 0.95
}
```

#### 4.1.3 `/api/chatbot/config` Endpoint

**PUT Request:**
```http
PUT /api/chatbot/config
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "provider": "openai",  // "openai", "anthropic", or "google"
  "api_key": "sk-...",
  "model": "gpt-4"  // "gpt-4", "claude-3-opus", "gemini-pro", etc.
}
```

**Response:**
```json
{
  "success": true,
  "message": "Configuration saved successfully"
}
```

**GET Request:**
```http
GET /api/chatbot/config
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "provider": "openai",
    "model": "gpt-4",
    "has_api_key": true  // Don't return the actual key
  }
}
```

#### 4.1.4 `/health` Endpoint

**Request:**
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "1.1",
  "database": "connected",
  "vector_db": "connected"
}
```

### 4.2 Database Schema (Supabase)

The system requires the following PostgreSQL schema with pgvector enabled:

#### 4.2.1 `bots` Table
Stores project metadata:
```sql
CREATE TABLE bots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4.2.2 `api_keys` Table
Stores widget authentication keys:
```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_value TEXT UNIQUE NOT NULL,
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used TIMESTAMP
);
```

#### 4.2.3 `documents` Table
Stores the vectors and content:
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  metadata JSONB NOT NULL, -- {"source": "file.pdf", "bot_id": "123"}
  embedding vector(768), -- 768-dimensional for Gemini text-embedding-004
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops);
```

#### 4.2.4 `user_api_keys` Table
Stores user-provided LLM API keys (encrypted):
```sql
CREATE TABLE user_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'openai', 'anthropic', 'google'
  api_key_encrypted TEXT NOT NULL, -- Encrypted API key
  model TEXT NOT NULL, -- 'gpt-4', 'claude-3-opus', 'gemini-pro', etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(bot_id, provider, model)
);
```

#### 4.2.5 Additional Tables

**users** (Supabase Auth):
- Handled by Supabase Auth system
- Provides JWT tokens for authentication

**chat_sessions** (Optional):
```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID REFERENCES bots(id),
  api_key_id UUID REFERENCES api_keys(id),
  created_at TIMESTAMP DEFAULT NOW(),
  last_message_at TIMESTAMP
);
```

**chat_messages** (Optional):
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id),
  role TEXT NOT NULL, -- 'user' or 'bot'
  content TEXT NOT NULL,
  sources TEXT[], -- Array of source filenames
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 5. Non-Functional Requirements

### 5.1 Security

- **NFR-01 (Data Sovereignty)**: A strict row-level security (RLS) or application-level logic must ensure no cross-contamination of data between different `bot_id`s (tenants)
- **NFR-02 (Encryption)**: All API communication must occur over HTTPS
- **NFR-03 (API Key Security)**: Widget API keys must be hashed in the database and never returned in full in responses
- **NFR-04 (User LLM API Key Security)**: User-provided LLM API keys must be encrypted at rest using strong encryption (AES-256) and never logged or exposed
- **NFR-05 (File Upload Security)**: File type validation, virus scanning, and size limits must be enforced

### 5.2 Performance

- **NFR-06 (Latency)**: The RAG inference pipeline (retrieval + generation) should respond within 3 seconds for standard queries
- **NFR-07 (Scalability)**: The ingestion engine must handle files up to 10MB without timing out
- **NFR-08 (Throughput)**: The system should handle at least 100 concurrent chat requests

### 5.3 Reliability

- **NFR-09**: The system shall handle LLM API failures gracefully by returning a structured error message to the client, not a stack trace
- **NFR-10**: The system should implement retry logic for transient failures
- **NFR-11**: Database connection pooling should be implemented for optimal performance
- **NFR-12**: If a user's LLM API key is invalid or fails, the system should return a clear error message without exposing the key

## 6. Technology Stack

### 6.1 Backend Framework
- **FastAPI** (Python) - RESTful API framework
- **Python 3.10+** - Programming language

### 6.2 AI & ML Libraries
- **LangChain** - Orchestration framework for RAG pipeline
  - `PyPDFLoader` - PDF text extraction
  - `RecursiveCharacterTextSplitter` - Text chunking
  - `create_retrieval_chain` - RAG chain creation
- **Google Gemini API** - LLM inference
  - `gemini-1.5-flash` - Chat model
  - `text-embedding-004` - Embedding model (768 dimensions)

### 6.3 Database
- **Supabase** (PostgreSQL)
  - **pgvector** extension for vector storage and similarity search
  - Row-Level Security (RLS) for multi-tenancy
  - Supabase Auth for JWT generation

### 6.4 Additional Services
- **Redis** (Optional) - Caching and session management
- **Background Job Queue** (Optional) - For async document processing
- **Encryption Library** - For encrypting/decrypting user LLM API keys (e.g., `cryptography` for Python)

## 7. Implementation Details

### 7.1 Document Ingestion Flow

1. **Upload**: PDF file received via `/ingest` endpoint
2. **Authentication**: JWT validated, `bot_id` extracted
3. **Parsing**: `PyPDFLoader` extracts text from PDF
4. **Chunking**: `RecursiveCharacterTextSplitter` splits text into ~2000 character chunks
5. **Embedding**: Each chunk converted to 768-dim vector using `text-embedding-004`
6. **Storage**: Chunks + embeddings + metadata stored in Supabase `documents` table

### 7.2 RAG Chat Flow

1. **Request**: User query received via `/chat` endpoint with `x-api-key` header
2. **Authentication**: API key validated, `bot_id` extracted
3. **Get User LLM Config**: Retrieve user's stored LLM API key and model preference from `user_api_keys` table (decrypt API key)
4. **Query Embedding**: User query converted to vector using `text-embedding-004` (or user's provider's embedding model)
5. **Vector Search**: Cosine similarity search in Supabase with `bot_id` filter
6. **Retrieval**: Top-k relevant chunks retrieved (e.g., top 5)
7. **Generation**: LangChain `create_retrieval_chain` passes context + query to user's configured LLM model using their stored API key
8. **Response**: AI response + source filenames returned to client

### 7.3 Multi-Tenancy Implementation

- **Row-Level Security (RLS)**: Supabase RLS policies ensure users can only access their own `bot_id` data
- **Application-Level Filtering**: All queries must include `bot_id` filter in metadata
- **API Key Isolation**: Each API key is linked to a specific `bot_id`, ensuring complete data isolation

## 8. Environment Variables

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application
API_KEY_SECRET=secret-for-api-key-hashing
ENCRYPTION_KEY=secret-key-for-encrypting-user-llm-api-keys
JWT_SECRET=handled-by-supabase

# Server
PORT=8000
ENVIRONMENT=production

# Optional
REDIS_URL=redis://localhost:6379

# Note: User LLM API keys (OpenAI, Anthropic, Google) are NOT stored as environment variables.
# They are provided by users through the frontend and stored encrypted in the database.
```

## 9. Error Handling

### 9.1 Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {} // Optional additional details
  }
}
```

### 9.2 Common Error Codes

- `AUTH_REQUIRED` - Authentication required
- `INVALID_API_KEY` - API key is invalid or expired
- `UNAUTHORIZED` - User doesn't have access to this resource
- `FILE_TOO_LARGE` - Uploaded file exceeds 10MB limit
- `INVALID_FILE_TYPE` - File type not supported (only PDF)
- `LLM_ERROR` - Error from Gemini API
- `DATABASE_ERROR` - Database connection or query error
- `PROCESSING_ERROR` - Error during document processing

## 10. Integration Points with Frontend

1. **Documents Page** → `POST /ingest` (with JWT)
2. **Chatbot Page** → `POST /chat` (with x-api-key)
3. **Integration Page** → API key management (handled by Supabase)
4. **Chatbot Config Page** → `PUT /api/chatbot/config` - Store user's LLM API key and model preference
   - User provides their own OpenAI/Anthropic/Google API key
   - Backend encrypts and stores it in `user_api_keys` table
   - Backend uses this key for all chat requests from that bot_id
5. **Usage Stats** → Custom analytics endpoints (optional)

### 10.1 User LLM API Key Flow

1. **User Configuration**: User goes to Chatbot Config page in frontend
2. **API Key Input**: User enters their LLM provider API key (OpenAI, Anthropic, or Google)
3. **Model Selection**: User selects their preferred model (GPT-4, Claude 3, Gemini Pro, etc.)
4. **Save to Backend**: Frontend sends to `PUT /api/chatbot/config`:
   ```json
   {
     "provider": "openai",
     "api_key": "sk-...",
     "model": "gpt-4"
   }
   ```
5. **Backend Storage**: Backend encrypts API key and stores in `user_api_keys` table
6. **Usage**: When user makes chat requests, backend:
   - Retrieves encrypted API key for that bot_id
   - Decrypts the key
   - Uses it to call the LLM API
   - User never needs to configure environment variables

## 11. Testing Requirements

- Unit tests for document parsing and chunking
- Integration tests for RAG pipeline
- End-to-end tests for chat flow
- Load testing for concurrent requests
- Security testing for multi-tenancy isolation

## 12. Step-by-Step Development Order

This section outlines the recommended order of development to build the backend system incrementally and test each component.

### Phase 1: Foundation & Setup

**Step 1.1: Project Setup**
- [ ] Initialize FastAPI project structure
- [ ] Set up virtual environment and dependencies
- [ ] Configure environment variables
- [ ] Set up Supabase project and database
- [ ] Enable pgvector extension in Supabase
- [ ] Create basic project structure (routes, models, utils)

**Step 1.2: Database Schema**
- [ ] Create `bots` table
- [ ] Create `api_keys` table
- [ ] Create `documents` table with vector column
- [ ] Set up Row-Level Security (RLS) policies
- [ ] Create database indexes (including vector index)
- [ ] Test database connections

**Step 1.3: Basic API Structure**
- [ ] Set up FastAPI app with CORS middleware
- [ ] Create `/health` endpoint
- [ ] Implement basic error handling
- [ ] Set up logging configuration
- [ ] Create response models/schemas

### Phase 2: Authentication & Authorization

**Step 2.1: Supabase Integration**
- [ ] Integrate Supabase client library
- [ ] Implement JWT validation middleware
- [ ] Create authentication utilities
- [ ] Test JWT token validation

**Step 2.2: Widget API Key Management**
- [ ] Implement widget API key generation logic (for `/chat` endpoint)
- [ ] Create API key hashing/validation
- [ ] Build API key middleware for `/chat` endpoint
- [ ] Implement `bot_id` extraction from API keys
- [ ] Test API key authentication flow

**Step 2.3: User LLM API Key Storage**
- [ ] Design encryption strategy for user LLM API keys
- [ ] Implement encryption/decryption utilities
- [ ] Create endpoint to receive and store user API keys
- [ ] Test encryption and secure storage

**Step 2.4: Authorization**
- [ ] Implement data isolation checks
- [ ] Create helper functions for `bot_id` validation
- [ ] Ensure user API keys are only accessible by their bot_id
- [ ] Test multi-tenant data access restrictions

### Phase 3: Document Ingestion Pipeline

**Step 3.1: File Upload**
- [ ] Create `/ingest` endpoint structure
- [ ] Implement file upload handling (multipart/form-data)
- [ ] Add file validation (type, size limits)
- [ ] Test file upload endpoint

**Step 3.2: PDF Parsing**
- [ ] Install and configure LangChain
- [ ] Implement `PyPDFLoader` for text extraction
- [ ] Handle parsing errors gracefully
- [ ] Test PDF parsing with sample documents

**Step 3.3: Text Chunking**
- [ ] Implement `RecursiveCharacterTextSplitter`
- [ ] Configure chunk size (~2000 characters)
- [ ] Add chunk overlap configuration
- [ ] Test chunking with various document sizes

**Step 3.4: Embedding Generation**
- [ ] Integrate Google Gemini API
- [ ] Implement `text-embedding-004` model calls
- [ ] Create embedding generation function
- [ ] Handle API rate limits and errors
- [ ] Test embedding generation

**Step 3.5: Vector Storage**
- [ ] Implement Supabase vector insertion
- [ ] Store chunks with metadata (filename, bot_id)
- [ ] Test vector storage and retrieval
- [ ] Verify data isolation per bot_id

### Phase 4: RAG Chat Pipeline

**Step 4.1: Query Processing**
- [ ] Create `/chat` endpoint structure
- [ ] Implement query validation
- [ ] Extract `bot_id` from API key
- [ ] Test endpoint authentication

**Step 4.2: Vector Search**
- [ ] Implement query embedding generation
- [ ] Create cosine similarity search function
- [ ] Add `bot_id` metadata filtering
- [ ] Implement top-k retrieval (e.g., top 5 chunks)
- [ ] Test vector search accuracy

**Step 4.3: User LLM API Key Management**
- [ ] Create `user_api_keys` table in database
- [ ] Implement API key encryption/decryption functions
- [ ] Create endpoint to store user LLM API keys (`PUT /api/chatbot/config`)
- [ ] Implement API key retrieval by bot_id
- [ ] Test encryption and storage

**Step 4.4: RAG Chain**
- [ ] Install and configure LangChain retrieval chain
- [ ] Support multiple LLM providers (OpenAI, Anthropic, Google)
- [ ] Retrieve user's stored API key and model preference
- [ ] Create prompt template with context
- [ ] Implement retrieval chain with LangChain using user's API key
- [ ] Handle provider-specific API calls
- [ ] Test end-to-end RAG flow with different providers

**Step 4.5: Response Formatting**
- [ ] Extract source filenames from retrieved chunks
- [ ] Format response with sources and confidence
- [ ] Implement error handling for LLM failures (including invalid user API keys)
- [ ] Test response structure

### Phase 5: Error Handling & Optimization

**Step 5.1: Error Handling**
- [ ] Implement structured error responses
- [ ] Add error codes and messages
- [ ] Handle LLM API failures gracefully
- [ ] Add retry logic for transient failures
- [ ] Test error scenarios

**Step 5.2: Performance Optimization**
- [ ] Implement connection pooling
- [ ] Add caching for frequently accessed data
- [ ] Optimize vector search queries
- [ ] Add request timeout handling
- [ ] Performance testing and profiling

**Step 5.3: Logging & Monitoring**
- [ ] Set up structured logging
- [ ] Add request/response logging
- [ ] Implement health check monitoring
- [ ] Add metrics collection (optional)

### Phase 6: Testing & Documentation

**Step 6.1: Unit Testing**
- [ ] Write tests for authentication functions
- [ ] Test document parsing and chunking
- [ ] Test embedding generation
- [ ] Test vector search functions
- [ ] Test RAG chain components

**Step 6.2: Integration Testing**
- [ ] Test complete ingestion flow
- [ ] Test complete chat flow
- [ ] Test multi-tenant isolation
- [ ] Test error handling paths
- [ ] Load testing for concurrent requests

**Step 6.3: API Documentation**
- [ ] Add OpenAPI/Swagger documentation
- [ ] Document all endpoints
- [ ] Add request/response examples
- [ ] Document error codes

### Phase 7: Deployment Preparation

**Step 7.1: Environment Configuration**
- [ ] Set up production environment variables
- [ ] Configure production Supabase instance
- [ ] Set up SSL/HTTPS
- [ ] Configure CORS for production domains

**Step 7.2: Deployment**
- [ ] Choose deployment platform (e.g., Railway, Render, AWS)
- [ ] Set up CI/CD pipeline (optional)
- [ ] Deploy application
- [ ] Test production deployment
- [ ] Set up monitoring and alerts

### Development Checklist Summary

**Foundation:**
- [ ] Project setup and structure
- [ ] Database schema and RLS
- [ ] Basic API framework

**Core Features:**
- [ ] Authentication (JWT + API keys)
- [ ] Document ingestion pipeline
- [ ] RAG chat pipeline

**Quality & Production:**
- [ ] Error handling
- [ ] Testing
- [ ] Documentation
- [ ] Deployment

### Testing Order

1. **Unit Tests First**: Test individual functions in isolation
2. **Integration Tests**: Test complete flows (ingest → chat)
3. **Security Tests**: Verify multi-tenancy and data isolation
4. **Performance Tests**: Load testing and optimization
5. **End-to-End Tests**: Full system testing with frontend

### Dependencies Order

1. **Supabase Setup** → Required for all features
2. **Authentication** → Required before protected endpoints
3. **Document Ingestion** → Required before chat (need documents)
4. **RAG Pipeline** → Depends on ingested documents
5. **Optimization** → Can be done after core features work

## 13. Deployment Considerations

- Stateless design allows horizontal scaling
- Environment variables for configuration
- Health check endpoint for monitoring
- Graceful error handling for production
- Logging and monitoring setup required
