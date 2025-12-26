const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

async function handleResponse<ResponseType>(response: Response): Promise<ResponseType> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }
  return (await response.json()) as ResponseType;
}

export async function fetchChatbotConfig() {
  const response = await fetch(`${BASE_URL}/api/chatbot/config`, {
    method: "GET",
  });
  return handleResponse<{ success: boolean; data: { provider: string | null; model: string | null; has_api_key: boolean } }>(response);
}

export async function updateChatbotConfig(body: { provider: string; api_key: string; model: string }) {
  const response = await fetch(`${BASE_URL}/api/chatbot/config`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return handleResponse<{ success: boolean; message: string }>(response);
}

export async function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append("file", file, file.name);

  const response = await fetch(`${BASE_URL}/ingest`, {
    method: "POST",
    body: formData,
  });

  return handleResponse<{ success: boolean; message: string; document_id?: string; chunks_created?: number }>(response);
}

export async function fetchDocuments() {
  const response = await fetch(`${BASE_URL}/ingest/documents`, {
    method: "GET",
  });

  return handleResponse<{ items: { document_id: string; source: string; created_at: string }[] }>(response);
}

export async function sendChatMessage(body: { message: string; context?: string }) {
  const response = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return handleResponse<{ response: string; sources: string[]; confidence: number; bot_id?: string }>(response);
}
