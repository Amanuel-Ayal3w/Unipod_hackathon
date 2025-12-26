"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function IntegrationPage() {
  const { addToast } = useToast();
  const apiKey = "sk_demo_change_me";

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    addToast({
      title: "Copied",
      description: "API key copied to clipboard.",
      variant: "success",
    });
  };

  const maskedKey = "sk_demo_" + "•".repeat(16);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Developer Integration</h1>
          <p className="text-muted-foreground">
            Manage your API keys and widget settings.
          </p>
        </div>

        {/* Section 1: API Authentication Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Live API Key</CardTitle>
            <CardDescription>
              Use this key to authenticate requests from your website widget.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input type="text" value={maskedKey} readOnly className="pr-20 font-mono text-base py-3" />
              <Button
                onClick={handleCopy}
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8"
                variant="outline"
              >
                Copy
              </Button>
            </div>
            <Button
              variant="link"
              className="p-0 h-auto text-muted-foreground hover:text-foreground text-sm"
            >
              Regenerate Key
            </Button>
          </CardContent>
        </Card>

        {/* Section 2: Widget & SDK Installation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Widget & SDK Installation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-lg border-2 border-border flex items-center justify-center text-3xl font-mono bg-muted/30">
                  {"{}"}
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <p className="text-muted-foreground text-sm">
                  Install the JavaScript SDK in your app, or drop the widget snippet into your site footer.
                </p>

                <div className="space-y-3 text-xs font-mono bg-muted rounded-md p-4 overflow-x-auto">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">npm (SDK)</p>
                  <pre className="whitespace-pre-wrap">
{`npm install @supportbot/sdk

import { createSupportBotClient } from "@supportbot/sdk";

const client = createSupportBotClient({
  baseUrl: "${process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://api.example.com"}",
  apiKey: "${apiKey}",
});

const res = await client.sendMessage({
  message: "Hello from my app",
});`}
                  </pre>
                </div>

                <div className="space-y-3 text-xs font-mono bg-muted rounded-md p-4 overflow-x-auto">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Browser widget</p>
                  <pre className="whitespace-pre-wrap">
{`<script type="module">
  import { attachSupportBotWidget } from "https://your-cdn.com/supportbot-sdk.js";

  attachSupportBotWidget({
    baseUrl: "${process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://api.example.com"}",
    apiKey: "${apiKey}",
    welcomeMessage: "Hi! How can I help you today?",
  });
</script>`}
                  </pre>
                </div>

                <Link href="/documentation">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    View Full Docs <span className="ml-2">↗</span>
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Usage Stats */}
        <div className="w-full border-t pt-6 mt-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-foreground animate-pulse"></div>
              <span className="text-sm text-muted-foreground">System Operational</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Active Sessions: 0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

