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
            Complete guide to integrating and using the Lasta AI assistant.
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
                <li>Valid API key (Live or Test)</li>
                <li>Access to your website's HTML/JavaScript</li>
                <li>Documents uploaded and processed in the dashboard</li>
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
                Your API key is used to authenticate all requests to the Lasta AI service. 
                Keep your API key secure and never expose it in client-side code or public repositories.
              </p>
              <div className="bg-muted p-4 rounded-md font-mono text-sm">
                <code>lk_live_sk_...</code>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Using Your API Key</h3>
              <p className="text-muted-foreground mb-2">
                Include your API key in the Authorization header:
              </p>
              <div className="bg-muted p-4 rounded-md font-mono text-sm">
                <code>Authorization: Bearer YOUR_API_KEY</code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Widget Installation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Widget Installation</CardTitle>
            <CardDescription>
              Step-by-step guide to embed the chatbot widget
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">JavaScript SDK</h3>
              <p className="text-muted-foreground mb-4">
                Add the Lasta AI widget to your website by including our JavaScript SDK in your HTML.
              </p>
              <div className="bg-muted p-4 rounded-md">
                <pre className="text-sm overflow-x-auto">
{`<script src="https://cdn.lasta.ai/widget.js"></script>
<script>
  Lasta.init({
    apiKey: 'YOUR_API_KEY',
    position: 'bottom-right'
  });
</script>`}
                </pre>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Installation Steps</h3>
              <ol className="list-decimal list-inside text-muted-foreground space-y-2">
                <li>Copy your API key from the Integration page</li>
                <li>Add the script tag to your website's footer or before the closing body tag</li>
                <li>Replace YOUR_API_KEY with your actual API key</li>
                <li>Save and deploy your changes</li>
                <li>The chatbot widget will appear on your website</li>
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
              <h3 className="text-lg font-semibold mb-2">Widget Position</h3>
              <p className="text-muted-foreground mb-2">
                Choose where the chatbot widget appears on your page:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><code>bottom-right</code> - Bottom right corner (default)</li>
                <li><code>bottom-left</code> - Bottom left corner</li>
                <li><code>top-right</code> - Top right corner</li>
                <li><code>top-left</code> - Top left corner</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Customization</h3>
              <div className="bg-muted p-4 rounded-md">
                <pre className="text-sm overflow-x-auto">
{`Lasta.init({
  apiKey: 'YOUR_API_KEY',
  position: 'bottom-right',
  theme: 'light',
  primaryColor: '#000000',
  welcomeMessage: 'Hello! How can I help you?'
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
{`POST https://api.lasta.ai/v1/chat
Authorization: Bearer YOUR_API_KEY
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

