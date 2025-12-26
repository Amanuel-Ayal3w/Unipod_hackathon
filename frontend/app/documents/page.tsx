"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { UploadIcon, FileIcon } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { uploadDocument, fetchDocuments } from "@/lib/api";

type DocumentStatus = "pending" | "uploading" | "complete" | "error";

interface DocumentFile {
  file: File;
  status: DocumentStatus;
  id: string;
}

interface StoredDocument {
  document_id: string;
  source: string;
  created_at: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [storedDocuments, setStoredDocuments] = useState<StoredDocument[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  // Load previously indexed documents on mount
  useEffect(() => {
    fetchDocuments()
      .then((res) => {
        setStoredDocuments(res.items ?? []);
      })
      .catch((error: any) => {
        console.error("Failed to fetch documents", error);
      });
  }, []);

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
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (files: File[]) => {
    const validFiles = files.filter((file) => {
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      if (!isPdf) {
        addToast({
          title: "Unsupported file",
          description: `${file.name} is not a PDF.`,
          variant: "destructive",
        });
      }
      return isPdf;
    });

    const newDocuments: DocumentFile[] = validFiles.map((file) => ({
      file,
      status: "pending" as DocumentStatus,
      id: Math.random().toString(36).substring(7),
    }));
    if (newDocuments.length > 0) {
      setDocuments((prev) => [...prev, ...newDocuments]);
    }
  };

  const handleRemove = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleUpload = async () => {
    if (documents.length === 0) {
      return;
    }

    setIsUploading(true);
    for (const document of documents) {
      setDocuments((prev) =>
        prev.map((item) =>
          item.id === document.id ? { ...item, status: "uploading" as DocumentStatus } : item
        )
      );

      try {
        await uploadDocument(document.file);
        setDocuments((prev) =>
          prev.map((item) =>
            item.id === document.id ? { ...item, status: "complete" as DocumentStatus } : item
          )
        );
      } catch (error: any) {
        setDocuments((prev) =>
          prev.map((item) =>
            item.id === document.id ? { ...item, status: "error" as DocumentStatus } : item
          )
        );
        addToast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive",
        });
      }
    }
    setIsUploading(false);

    // Refresh stored documents list after upload completes
    try {
      const res = await fetchDocuments();
      setStoredDocuments(res.items ?? []);
    } catch (error) {
      console.error("Failed to refresh documents", error);
    }
  };

  const getStatusBadge = (status: DocumentStatus) => {
    const statusConfig = {
      pending: {
        label: "Pending",
        className: "bg-muted text-muted-foreground border border-border",
      },
      uploading: {
        label: "Uploading",
        className: "bg-muted text-foreground border border-foreground/20",
      },
      complete: {
        label: "Indexed",
        className: "bg-foreground text-background",
      },
      error: {
        label: "Error",
        className: "bg-destructive text-destructive-foreground",
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
                    disabled={isUploading}
                  >
                    Browse Files
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Files queued for upload */}
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
                      disabled={isUploading}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <Button className="flex-1" onClick={handleUpload} disabled={isUploading}>
                  {isUploading ? "Uploading..." : "Upload All"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDocuments([])}
                  disabled={isUploading}
                >
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stored / Indexed Documents */}
        {storedDocuments.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Indexed Documents</CardTitle>
              <CardDescription>
                These documents are already processed and stored in your knowledge base.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {storedDocuments.map((doc) => (
                  <div
                    key={doc.document_id + doc.source}
                    className="flex items-center justify-between p-3 border border-border rounded-md"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.source}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Indexed at {new Date(doc.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

