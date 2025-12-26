# Unipod Hackathon

This project contains the frontend, backend, and AI service components.

## Project Structure

```
Unipod_hackathon/
├── frontend/          # Next.js frontend application
├── backedn/          # FastAPI backend service
└── ai-service/       # AI service (if exists)
```

## Frontend

The frontend is a Next.js application located in the `frontend/` directory.

### Getting Started

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Features

- **Documents Page**: Upload and manage organization documents
- **Chatbot Page**: Test and interact with the AI assistant
- **Integration Page**: Manage API keys and widget settings
- **Documentation Page**: Complete integration guide and API reference

### Connecting to the Backend

- Copy `frontend/.env.example` to `.env.local` and set `NEXT_PUBLIC_BACKEND_URL` to your FastAPI origin (defaults to `http://localhost:8000`).
- Store a Supabase JWT in `localStorage` under `supportbot_access_token` so dashboard routes can authenticate ingestion/config requests.
- Store the widget `x-api-key` in `localStorage` under `supportbot_widget_key` to enable live testing on the Chatbot page.
