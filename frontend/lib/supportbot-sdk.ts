export interface SupportBotClientConfig {
  /** Base URL of your SupportBot backend, e.g. https://api.yourdomain.com */
  baseUrl?: string;
  /** API key issued for this integration */
  apiKey: string;
}

export interface SendMessageRequest {
  message: string;
  context?: string;
}

export interface SendMessageResponse {
  response: string;
  sources: string[];
  confidence: number;
  bot_id?: string;
}

const DEFAULT_BASE_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_BACKEND_URL) ||
  "http://localhost:8000";

export class SupportBotClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: SupportBotClientConfig) {
    this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
    this.apiKey = config.apiKey;
  }

  async sendMessage(payload: SendMessageRequest): Promise<SendMessageResponse> {
    const res = await fetch(`${this.baseUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `SupportBot request failed with ${res.status}`);
    }

    return (await res.json()) as SendMessageResponse;
  }
}

export function createSupportBotClient(config: SupportBotClientConfig): SupportBotClient {
  return new SupportBotClient(config);
}

// --- Lightweight embeddable widget helper ---

export interface WidgetOptions extends SupportBotClientConfig {
  /** Optional DOM element or selector to attach the widget inside. */
  container?: HTMLElement | string;
  /** Optional initial greeting displayed from the bot. */
  welcomeMessage?: string;
}

export function attachSupportBotWidget(options: WidgetOptions) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("SupportBot widget can only be used in the browser.");
  }

  const client = new SupportBotClient(options);
  const container =
    typeof options.container === "string"
      ? (document.querySelector(options.container) as HTMLElement | null)
      : options.container ?? document.body;

  if (!container) {
    throw new Error("SupportBot widget container not found.");
  }

  // Create a simple floating chat bubble + panel
  const root = document.createElement("div");
  root.style.position = "fixed";
  root.style.right = "24px";
  root.style.bottom = "24px";
  root.style.zIndex = "9999";
  root.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  const button = document.createElement("button");
  button.textContent = "Chat";
  button.style.borderRadius = "999px";
  button.style.border = "none";
  button.style.padding = "10px 18px";
  button.style.backgroundColor = "#111827";
  button.style.color = "white";
  button.style.cursor = "pointer";
  button.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.2)";

  const panel = document.createElement("div");
  panel.style.width = "360px";
  panel.style.maxHeight = "480px";
  panel.style.borderRadius = "16px";
  panel.style.boxShadow = "0 20px 25px -5px rgba(0,0,0,0.3)";
  panel.style.backgroundColor = "white";
  panel.style.display = "none";
  panel.style.flexDirection = "column";
  panel.style.overflow = "hidden";
  panel.style.marginBottom = "12px";

  const header = document.createElement("div");
  header.textContent = "SupportBot";
  header.style.padding = "10px 14px";
  header.style.fontSize = "14px";
  header.style.fontWeight = "600";
  header.style.backgroundColor = "#111827";
  header.style.color = "white";

  const messagesEl = document.createElement("div");
  messagesEl.style.flex = "1";
  messagesEl.style.padding = "10px";
  messagesEl.style.overflowY = "auto";
  messagesEl.style.fontSize = "14px";
  messagesEl.style.backgroundColor = "#f9fafb";

  const inputRow = document.createElement("div");
  inputRow.style.display = "flex";
  inputRow.style.gap = "8px";
  inputRow.style.padding = "8px";
  inputRow.style.borderTop = "1px solid #e5e7eb";
  inputRow.style.backgroundColor = "white";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Ask a question...";
  input.style.flex = "1";
  input.style.fontSize = "14px";
  input.style.padding = "6px 8px";
  input.style.border = "1px solid #d1d5db";
  input.style.borderRadius = "6px";

  const sendBtn = document.createElement("button");
  sendBtn.textContent = "Send";
  sendBtn.style.fontSize = "14px";
  sendBtn.style.padding = "6px 10px";
  sendBtn.style.borderRadius = "6px";
  sendBtn.style.border = "none";
  sendBtn.style.backgroundColor = "#111827";
  sendBtn.style.color = "white";
  sendBtn.style.cursor = "pointer";

  inputRow.appendChild(input);
  inputRow.appendChild(sendBtn);

  panel.appendChild(header);
  panel.appendChild(messagesEl);
  panel.appendChild(inputRow);

  root.appendChild(panel);
  root.appendChild(button);

  container.appendChild(root);

  const addMessage = (text: string, sender: "user" | "bot") => {
    const row = document.createElement("div");
    row.style.marginBottom = "6px";
    row.style.display = "flex";
    row.style.justifyContent = sender === "user" ? "flex-end" : "flex-start";

    const bubble = document.createElement("div");
    bubble.textContent = text;
    bubble.style.maxWidth = "80%";
    bubble.style.padding = "6px 10px";
    bubble.style.borderRadius = "999px";
    bubble.style.whiteSpace = "pre-wrap";
    bubble.style.backgroundColor = sender === "user" ? "#111827" : "#e5e7eb";
    bubble.style.color = sender === "user" ? "white" : "#111827";

    row.appendChild(bubble);
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  };

  if (options.welcomeMessage) {
    addMessage(options.welcomeMessage, "bot");
  }

  let isOpen = false;

  button.onclick = () => {
    isOpen = !isOpen;
    panel.style.display = isOpen ? "flex" : "none";
  };

  const send = async () => {
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, "user");
    input.value = "";
    sendBtn.disabled = true;

    try {
      const res = await client.sendMessage({ message: text });
      addMessage(res.response, "bot");
    } catch (err: any) {
      console.error("SupportBot error", err);
      addMessage("Sorry, something went wrong.", "bot");
    } finally {
      sendBtn.disabled = false;
    }
  };

  sendBtn.onclick = send;
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  });

  return {
    client,
    destroy() {
      root.remove();
    },
  };
}
