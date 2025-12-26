"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { fetchChatbotConfig, updateChatbotConfig } from "@/lib/api";

type AIModel = "gpt-4" | "gpt-3.5-turbo" | "claude-3-opus" | "claude-3-sonnet" | "gemini-2.5-flash";
const MODEL_PROVIDER: Record<AIModel, "openai" | "anthropic" | "google"> = {
  "gpt-4": "openai",
  "gpt-3.5-turbo": "openai",
  "claude-3-opus": "anthropic",
  "claude-3-sonnet": "anthropic",
  "gemini-2.5-flash": "google",
};

export default function ChatbotConfigPage() {
  const [selectedModel, setSelectedModel] = useState<AIModel>("gpt-4");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchChatbotConfig()
      .then(({ data }) => {
        if (data.model && (Object.keys(MODEL_PROVIDER) as AIModel[]).includes(data.model as AIModel)) {
          setSelectedModel(data.model as AIModel);
        }
        setHasStoredKey(Boolean(data.has_api_key));
      })
      .catch((error) => {
        addToast({
          title: "Failed to load config",
          description: error.message,
          variant: "destructive",
        });
      })
      .finally(() => setIsLoading(false));
  }, [addToast]);

  const provider = useMemo(() => MODEL_PROVIDER[selectedModel], [selectedModel]);

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      if (!apiKey) {
        if (hasStoredKey) {
          addToast({
            title: "API key required",
            description: "Enter a new API key when updating your configuration.",
            variant: "destructive",
          });
          return;
        }
        addToast({
          title: "API key required",
          description: "Enter an API key for the selected provider.",
          variant: "destructive",
        });
        return;
      }

      await updateChatbotConfig({ provider, api_key: apiKey, model: selectedModel });
      setApiKey("");
      setHasStoredKey(true);
      addToast({
        title: "Configuration Saved",
        description: "Your chatbot settings are stored securely.",
        variant: "success",
      });
    } catch (error: any) {
      addToast({
        title: "Failed to save",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [addToast, apiKey, hasStoredKey, provider, selectedModel]);

  const handleCopyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      addToast({
        title: "Copied",
        description: "API key copied to clipboard.",
        variant: "success",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Chatbot Configuration</h1>
          <p className="text-muted-foreground">
            Configure your chatbot settings and API keys.
          </p>
        </div>

        {/* AI Model Configuration */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>AI Model Selection</CardTitle>
            <CardDescription>
              Choose the AI model that will power your chatbot responses.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select AI Model
              </label>
              <Select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as AIModel)}
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="claude-3-opus">Claude 3 Opus</option>
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              </Select>
            </div>
            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Current selection:</strong> {selectedModel}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                The selected model will be used for all chatbot interactions. Different models have different capabilities and pricing.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* API Key Configuration */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>API Key Configuration</CardTitle>
            <CardDescription>
              Add your own API key for the selected AI model provider. This allows you to use your own API credits.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                API Key
              </label>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  placeholder="Enter your API key..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pr-20"
                  disabled={isLoading}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="h-8 px-2"
                    disabled={isLoading}
                  >
                    {showApiKey ? "Hide" : "Show"}
                  </Button>
                  {apiKey && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyApiKey}
                      className="h-8 px-2"
                    >
                      Copy
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Your API key is encrypted on the server. Keep a copy for your records; the full value is not retrievable later.
              </p>
              {hasStoredKey && !apiKey && (
                <p className="text-xs text-muted-foreground mt-1">
                  A key is already stored. Enter a new value to rotate it.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Provider Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Provider Information</CardTitle>
            <CardDescription>
              Get API keys from your preferred AI model provider
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="border border-border rounded-md p-4">
                <h4 className="font-medium mb-1">OpenAI (GPT-4, GPT-3.5 Turbo)</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Get your API key from OpenAI Platform
                </p>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-foreground underline"
                >
                  Visit OpenAI Platform →
                </a>
              </div>
              <div className="border border-border rounded-md p-4">
                <h4 className="font-medium mb-1">Anthropic (Claude 3)</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Get your API key from Anthropic Console
                </p>
                <a
                  href="https://console.anthropic.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-foreground underline"
                >
                  Visit Anthropic Console →
                </a>
              </div>
              <div className="border border-border rounded-md p-4">
                <h4 className="font-medium mb-1">Google (Gemini Pro)</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Get your API key from Google AI Studio
                </p>
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-foreground underline"
                >
                  Visit Google AI Studio →
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setApiKey("");
              setSelectedModel("gpt-4");
              addToast({
                title: "Reset",
                description: "Configuration has been reset to defaults.",
                variant: "default",
              });
            }}
            disabled={isLoading || isSaving}
          >
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isLoading || isSaving}>
            {isSaving ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </div>
    </div>
  );
}

