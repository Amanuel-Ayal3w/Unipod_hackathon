import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Documentation</h1>
          <p className="text-muted-foreground">
            Guide to integrating the Lasta AI assistant via the JavaScript SDK, browser widget, and dashboard.
          </p>
        </div>

        {/* Getting Started */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Quick start guide for integrating Lasta AI into your platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Overview</h3>
              <p className="text-muted-foreground mb-4">
                Lasta AI provides a powerful chatbot solution that can be easily integrated into your government portal or website. 
                The AI assistant is trained on your organization's documents and can provide accurate, context-aware responses.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Prerequisites</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Backend URL (e.g. https://api.yourdomain.com)</li>
                <li>API key from the Integration page</li>
                <li>Access to your website's HTML/JavaScript</li>
                <li>Documents uploaded and processed via the Documents page</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* API Authentication */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>API Authentication</CardTitle>
            <CardDescription>
              How to authenticate your requests using API keys
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">API Keys</h3>
              <p className="text-muted-foreground mb-4">
                Your API key identifies your chatbot when calling the SupportBot backend. Keep it secret in server-side code or environment variables when possible.
              </p>
              <div className="bg-muted p-4 rounded-md font-mono text-sm">
                <code>sk_demo_************************</code>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Using Your API Key</h3>
              <p className="text-muted-foreground mb-2">
                For direct HTTP calls, include your API key in the <code>x-api-key</code> header:
              </p>
              <div className="bg-muted p-4 rounded-md font-mono text-sm">
                <code>x-api-key: YOUR_API_KEY</code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SDK & Widget Installation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>SDK & Widget Installation</CardTitle>
            <CardDescription>
              Use the TypeScript SDK in your app, or embed the browser widget
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">TypeScript / JavaScript SDK</h3>
              <p className="text-muted-foreground mb-4">
                Install the SDK in your application and call the <code>/chat</code> endpoint through a simple client.
              </p>
              <div className="bg-muted p-4 rounded-md">
                <pre className="text-sm overflow-x-auto">
{`npm install @supportbot/sdk

import { createSupportBotClient } from "@supportbot/sdk";

const client = createSupportBotClient({
  baseUrl: "https://api.yourdomain.com",
  apiKey: "YOUR_API_KEY",
});

const res = await client.sendMessage({
  message: "Hello from my app",
});`}
                </pre>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Browser Widget</h3>
              <p className="text-muted-foreground mb-2">
                To quickly embed the chatbot on any website, use the browser widget helper:
              </p>
              <div className="bg-muted p-4 rounded-md">
                <pre className="text-sm overflow-x-auto">
{`<script type="module">
  import { attachSupportBotWidget } from "https://your-cdn.com/supportbot-sdk.js";

  attachSupportBotWidget({
    baseUrl: "https://api.yourdomain.com",
    apiKey: "YOUR_API_KEY",
    welcomeMessage: "Hi! How can I help you today?",
  });
</script>`}
                </pre>
              </div>
              <ol className="list-decimal list-inside text-muted-foreground space-y-2 mt-3">
                <li>Copy your API key from the Integration page</li>
                <li>Add the widget snippet before <code>&lt;/body&gt;</code> on your site</li>
                <li>Replace <code>YOUR_API_KEY</code> and <code>https://api.yourdomain.com</code> with your values</li>
                <li>Deploy your site—the chat bubble appears in the bottom-right corner</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Options */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Configuration Options</CardTitle>
            <CardDescription>
              Customize the chatbot appearance and behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Widget Options</h3>
              <p className="text-muted-foreground mb-2">
                The browser widget helper accepts a small set of options:
              </p>
              <div className="bg-muted p-4 rounded-md">
                <pre className="text-sm overflow-x-auto">
{`attachSupportBotWidget({
  baseUrl: "https://api.yourdomain.com",
  apiKey: "YOUR_API_KEY",
  welcomeMessage: "Hello! How can I help you?",
});`}
                </pre>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Customization</h3>
              <div className="bg-muted p-4 rounded-md">
                <pre className="text-sm overflow-x-auto">
{`// For full control, you can build your own UI
// and call the SDK client directly from your app.

const res = await client.sendMessage({
  message: "Hello!",
  context: "optional extra context",
});`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Management */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Document Management</CardTitle>
            <CardDescription>
              How to upload and manage documents for the AI assistant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Uploading Documents</h3>
              <p className="text-muted-foreground mb-4">
                Upload your organization's documents through the Documents page in the dashboard. 
                Supported formats include PDF, DOC, DOCX, and TXT files.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Document Status</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>Ready:</strong> Document is processed and ready for use</li>
                <li><strong>Not Ready:</strong> Document is still being processed</li>
                <li><strong>Ready for Suggestion:</strong> Document is ready and AI can provide suggestions</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* API Reference */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>API Reference</CardTitle>
            <CardDescription>
              Complete API endpoint documentation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Send Message</h3>
              <div className="bg-muted p-4 rounded-md mb-2">
                <pre className="text-sm overflow-x-auto">
{`POST https://api.yourdomain.com/chat
x-api-key: YOUR_API_KEY
Content-Type: application/json

{
  "message": "Your question here",
  "context": "optional context"
}`}
                </pre>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Response Format</h3>
              <div className="bg-muted p-4 rounded-md">
                <pre className="text-sm overflow-x-auto">
{`{
  "response": "AI generated response",
  "sources": ["document1.pdf", "document2.pdf"],
  "confidence": 0.95
}`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardHeader>
            <CardTitle>Support</CardTitle>
            <CardDescription>
              Need help? We're here for you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              If you encounter any issues or have questions about integrating Lasta AI, 
              please contact our support team or check the Integration page for your API keys.
            </p>
            <Link href="/integration">
              <Button variant="outline">Go to Integration Page</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

