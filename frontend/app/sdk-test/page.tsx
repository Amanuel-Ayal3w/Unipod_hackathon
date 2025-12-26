"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createSupportBotClient } from "@/lib/supportbot-sdk";

const client = createSupportBotClient({
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000",
  apiKey: "sk_demo_anything", // backend currently ignores x-api-key in demo mode
});

export default function SdkTestPage() {
  const [message, setMessage] = useState("Hello from the SDK test page");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>("");

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setResponse("");
    try {
      const res = await client.sendMessage({ message });
      setResponse(JSON.stringify(res, null, 2));
    } catch (err: any) {
      setResponse(`Error: ${err?.message ?? String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>SDK Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask the bot something..."
              disabled={loading}
            />
          </div>
          <Button onClick={handleSend} disabled={loading || !message.trim()} className="w-full">
            {loading ? "Sending..." : "Send via SDK"}
          </Button>
          <div className="space-y-2">
            <label className="text-sm font-medium">Raw SDK response</label>
            <Textarea
              value={response}
              readOnly
              className="h-48 font-mono text-xs"
              placeholder="Response will appear here"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
