"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UploadIcon, FileIcon } from "@/components/icons";

type DocumentStatus = "ready" | "not-ready" | "ready-for-suggestion";

interface DocumentFile {
  file: File;
  status: DocumentStatus;
  id: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const newDocuments: DocumentFile[] = droppedFiles.map((file) => ({
      file,
      status: "not-ready" as DocumentStatus,
      id: Math.random().toString(36).substring(7),
    }));
    setDocuments((prev) => [...prev, ...newDocuments]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const newDocuments: DocumentFile[] = selectedFiles.map((file) => ({
        file,
        status: "not-ready" as DocumentStatus,
        id: Math.random().toString(36).substring(7),
      }));
      setDocuments((prev) => [...prev, ...newDocuments]);
    }
  };

  const handleRemove = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleUpload = () => {
    // Simulate upload and status change
    setDocuments((prev) =>
      prev.map((doc) => {
        // Simulate random status assignment after upload
        const randomStatus: DocumentStatus[] = ["ready", "not-ready", "ready-for-suggestion"];
        const randomIndex = Math.floor(Math.random() * randomStatus.length);
        return {
          ...doc,
          status: randomStatus[randomIndex],
        };
      })
    );
  };

  const getStatusBadge = (status: DocumentStatus) => {
    const statusConfig = {
      ready: {
        label: "Ready",
        className: "bg-foreground text-background",
      },
      "not-ready": {
        label: "Not Ready",
        className: "bg-muted text-muted-foreground border border-border",
      },
      "ready-for-suggestion": {
        label: "Ready for Suggestion",
        className: "bg-muted text-foreground border border-foreground/20",
      },
    };

    const config = statusConfig[status];

    return (
      <span
        className={cn(
          "px-2 py-1 rounded-md text-xs font-medium",
          config.className
        )}
      >
        {config.label}
      </span>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Documents</h1>
          <p className="text-muted-foreground">
            Upload and manage your organization documents.
          </p>
        </div>

        {/* Upload Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
            <CardDescription>
              Drag and drop files here or click to browse. Supported formats: PDF, DOC, DOCX, TXT
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
                isDragging
                  ? "border-foreground bg-muted"
                  : "border-border hover:border-foreground/50"
              )}
            >
              <div className="flex flex-col items-center gap-4">
                <UploadIcon className="w-12 h-12 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium mb-1">
                    {isDragging ? "Drop files here" : "Drag files here"}
                  </p>
                  <p className="text-xs text-muted-foreground">or</p>
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse Files
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Files List */}
        {documents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Files</CardTitle>
              <CardDescription>
                {documents.length} file{documents.length !== 1 ? "s" : ""} uploaded
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border border-border rounded-md"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.file.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(doc.file.size)}
                          </p>
                          <span className="text-muted-foreground">•</span>
                          {getStatusBadge(doc.status)}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(doc.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <Button className="flex-1" onClick={handleUpload}>
                  Upload All
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDocuments([])}
                >
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

