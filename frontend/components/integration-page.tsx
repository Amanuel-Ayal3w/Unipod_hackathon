"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function IntegrationPage() {
  const [copied, setCopied] = useState(false);
  const apiKey = "lk_live_sk_test_1234567890abcdefghijklmnopqrstuvwxyz";

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Show only the prefix, mask the rest
  const maskedKey = "lk_live_" + "•".repeat(32);

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
              <Input
                type="text"
                value={maskedKey}
                readOnly
                className="pr-20 font-mono text-base py-3"
              />
              <Button
                onClick={handleCopy}
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8"
                variant="outline"
              >
                {copied ? "Copied!" : "Copy"}
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

        {/* Section 2: Widget Configuration Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Widget Installation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-lg border-2 border-border flex items-center justify-center text-3xl font-mono bg-muted/30">
                  {"{}"}
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <p className="text-muted-foreground">
                  Embed the AI support bot on your government portal by adding our JavaScript SDK to your footer.
                </p>
                <Link href="/documentation">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    View Integration Docs{" "}
                    <span className="ml-2">↗</span>
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

